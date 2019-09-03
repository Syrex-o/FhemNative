#################################################################
#
#  Copyright notice
#
#  (c) 2014
#  Copyright: Norbert Truchsess (norbert.truchsess@t-online.de)
#  All rights reserved
#
#  This script free software; you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation; either version 2 of the License, or
#  (at your option) any later version.
#
#  The GNU General Public License can be found at
#  http://www.gnu.org/copyleft/gpl.html.
#  A copy is found in the textfile GPL.txt and important notices to the license
#  from the author is found in LICENSE.txt distributed with these scripts.
#
#  This script is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  This copyright notice MUST APPEAR in all copies of the script!
#
#  Homepage:  http://fhem.de
#
# $Id$

package main;
use strict;
use warnings;

##########################
sub websocket_json_Initialize($)
{
  my ($hash) = @_;

  # Provider
  $hash->{DefFn}    = "websocket_json::Define";
  $hash->{NotifyFn} = "websocket_json::Notify";
  $hash->{AttrFn}   = "websocket_json::Attr";
  $hash->{AttrList} = "IODev";
  
  main::LoadModule("websocket");
}

package websocket_json;

use strict;
use warnings;

use GPUtils qw(:all);

use JSON;
use Time::Local;
use POSIX qw(strftime);

use Data::Dumper;

BEGIN {GP_Import(qw(
  AssignIoPort
  CommandDefine
  Log3
  devspec2array
  IsIgnored
  getAllSets
  getAllGets
  getAllAttr
  AnalyzeCommand
  AnalyzeCommandChain
))};

##########################
sub Define($$$)
{
  my ($hash, $def) = @_;

  my @args = split("[ \t][ \t]*", $def);

  return "Usage: define <name> websocket_json" if (@args < 2 or @args > 3);

  $hash->{resource} = @args == 3 ? $args[3] : '/';
  $hash->{NOTIFYDEV} = '';
  $hash->{websockets} = [];
  subscribeMsgType($hash,'command',\&onCommandMessage);

  if ($main::init_done) {
    Init($hash);
  }
}

sub Init($) {
  my ($hash) = @_;
  AssignIoPort($hash);
  unless ($hash->{IODev}) {
    CommandDefine(undef, "websocketPort websocket 8080 global");
    AssignIoPort($hash);
  }
  if ($hash->{IODev}) {
    websocket::subscribeOpen($hash->{IODev},\&onSocketConnected,$hash);
    websocket::subscribeClose($hash->{IODev},\&onSocketClosed,$hash);
  }
}

sub Notify() {
  my ($hash,$dev) = @_;

  if ($dev->{NAME} eq 'global') {
    if( grep(m/^(INITIALIZED|REREADCFG)$/, @{$dev->{CHANGED}}) ) {
      Init($hash);
    } elsif( grep(m/^SAVE$/, @{$dev->{CHANGED}}) ) {
    }
  } else {
    foreach my $cl (@{$hash->{websockets}}) {
      foreach my $arg (keys %{$cl->{eventSubscriptions}}) {
        my @changed = ();
        foreach my $changed (@{$dev->{CHANGED}}) {
          push @changed,$changed if (grep {($dev->{NAME} =~ /$_->{name}/) and ($dev->{TYPE} =~ /$_->{type}/) and ($changed =~ /$_->{changed}/)} @{$cl->{eventSubscriptions}->{$arg}});
        }
        sendTypedMessage($cl,'event',{
          name    => $dev->{NAME},
          type    => $dev->{TYPE},
          arg     => $arg,
          'time'  => strftime ("%c GMT", _fhemTimeGm($dev->{NTFY_TRIGGERTIME})),
          changed => {map {$_=~ /^([^:]+)(: )?(.*)$/; ((defined $3) and ($3 ne "")) ? ($1 => $3) : ('STATE' => $1) } @changed},
        }) if (@changed);
      }
    }
  }
}

sub Attr($$$$) {
  my ($command,$name,$attribute,$value) = @_;
  my $hash = $main::defs{$name};
  eval {
    ARGUMENT_HANDLER: {
      $attribute eq "IODev" and do {
        if ($hash->{IODev}) {
          websocket::unsubscribeOpen($hash->{IODev},$hash);
          websocket::unsubscribeClose($hash->{IODev},$hash);
        };
        if ($command eq "set") {
          if ($main::init_done and (!defined ($hash->{IODev}) or $hash->{IODev}->{NAME} ne $value)) {
            AssignIOPort($hash,$value);
            if ($hash->{IODev}) {
              websocket::subscribeOpen($hash->{IODev},\&onSocketConnected,$hash);
              websocket::subscribeClose($hash->{IODev},\&onSocketClosed,$hash);
            }
          }
        };
        last;
      };
    }
  };
  return "websocket_json: error setting attr '$attribute': ".GP_Catch($@) if $@;
  return undef;
}

# these are websocket-protocol callback methods:

sub onSocketConnected($$$@) {
  my ($cl,$hash,$resource,@protocols) = @_;
  if ($resource eq $hash->{resource} and grep (/^json$/,@protocols)) {
    websocket::subscribeTextMessage($cl,\&onMessage,$hash);
    push @{$hash->{websockets}},$cl;
    return 'json';
  } else {
    return undef;
  }
}

sub
onSocketClosed($$) {
  my ($cl,$hash) = @_;
  $hash->{websockets} = [grep {$_ != $cl} @{$hash->{websockets}}];
}

sub onMessage($$$) {
  my ($cl,$hash,$message) = @_;
  eval {
    if (my $json = decode_json $message) {
      Log3 ($cl->{SNAME},5,"websocket jsonmessage: ".Dumper($json));
      if (defined (my $type = $json->{type})) {
        if (defined (my $fn = $hash->{typeSubscriptions}->{$type})) {
          &$fn($cl,$hash,$json->{payload});
        } else {
          Log3 ($cl->{SNAME},5,"websocket ignoring json-message type '$type' without subscription");
        }
      } else {
        Log3 ($cl->{SNAME},4,"websocket json-message without type: $message");
      }
    }
  };
  Log3 ($cl->{SNAME},4,"websocket_json: ".GP_Catch($@)) if $@;
}

sub onCommandMessage($$$) {
  my ($cl,$hash,$message) = @_;
  if (defined (my $command = $message->{command})) {
    COMMAND: {
      $command eq "subscribe" and do {
        subscribeEvent($cl,%$message);
        last;
      };
      $command eq "unsubscribe" and do {
        unsubscribeEvent($cl,$message->{arg});
        last;
      };
      $command eq "list" and do {
        my @devs = grep {!IsIgnored($_)} (defined $message->{arg}) ? devspec2array($message->{arg}) : keys %main::defs;
        Log3 ($cl->{SNAME},5,"websocket command list devs: ".join(",",@devs));
        my $i = 0;
        my $num = @devs;
        foreach my $dev (@devs) {
          my $h = $main::defs{$dev};
          my $r = $h->{READINGS};
          sendTypedMessage($cl,'listentry',{
            arg        => $message->{arg},
            name       => $dev,
            'index'    => $i++,
            num        => $num,
            sets       => {map {if ($_ =~ /:/) { $_ =~ /^(.+):(.*)$/; $1 => [split (",",$2)] } else { $_ => undef } } split(/ /,getAllSets($dev))},
            gets       => {map {if ($_ =~ /:/) { $_ =~ /^(.+):(.*)$/; $1 => [split (",",$2)] } else { $_ => undef } } split(/ /,getAllGets($dev))},
            attrList   => {map {if ($_ =~ /:/) { $_ =~ /^(.+):(.*)$/; $1 => [split (",",$2)] } else { $_ => undef } } split(/ /,getAllAttr($dev))},
            internals  => {map {(ref ($h->{$_}) eq "") ? ($_ => $h->{$_}) : ()} keys %$h},
            readings   => {map {$_ => {Value  => $r->{$_}->{VAL}, 'Time' => strftime ("%c GMT", _fhemTimeGm($r->{$_}->{TIME}))}} keys %$r},
            attributes => $main::attr{$dev},
          });
        }
        last;
      };
      $command eq "smalllist" and do {
        my @devs = grep {!IsIgnored($_)} (defined $message->{arg}) ? devspec2array($message->{arg}) : keys %main::defs;
        Log3 ($cl->{SNAME},5,"websocket command list devs: ".join(",",@devs));
        my $i = 0;
        my $num = @devs;
        foreach my $dev (@devs) {
          my $h = $main::defs{$dev};
          my $r = $h->{READINGS};
          sendTypedMessage($cl,'listentry',{
            arg        => $message->{arg},
            name       => $dev,
            'index'    => $i++,
            num        => $num,
            readings   => {map {$_ => {Value  => $r->{$_}->{VAL}, 'Time' => strftime ("%c GMT", _fhemTimeGm($r->{$_}->{TIME}))}} keys %$r},
            #attributes => $main::attr{$dev},
          });
        }
        last;
      };	
      $command eq "get" and do {
        my $ret = AnalyzeCommand($cl, 'get '.($message->{device} // '').' '.($message->{property} // ''));
        sendTypedMessage($cl,'getreply',{
          device   => $message->{device},
          property => $message->{property},
          value    => $ret
        });
        last;
      };
      my $ret = AnalyzeCommandChain($cl, $command);
      sendTypedMessage($cl,'commandreply',{
        command => $command,
        reply   => $ret // '',
      });
    };
  } else {
    Log3 ($cl->{SNAME},4,"websocket no command in command-message");
  }
}

sub _fhemTimeGm($)
{
  my ($fhemtime) = @_;
  $fhemtime =~ /^(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)$/;
  return gmtime timelocal($6,$5,$4,$3,$2-1,$1);
}

# these are json-protocol API methods:

sub subscribeMsgType($$$) {
  my ($hash,$type,$sub) = @_;
  $hash->{typeSubscriptions}->{$type} = $sub;
  Log3 ($hash->{NAME},5,"websocket_json subscribe for messagetype: '$type' $sub");
}

sub unsubscribeMsgType($$) {
my ($cl,$type) = @_;
my $deleted = (delete $cl->{typeSubscriptions}->{$type}) // "- undefined";
Log3 ($cl->{SNAME},5,"websocket unsubscribe for messagetype: '$type' $deleted");
}

sub subscribeEvent($@) {
  my ($cl,%args) = @_;
  my $arg     = $args{arg}     // '';
  my $name    = $args{name}    // '';
  my $type    = $args{type}    // '';
  my $changed = $args{changed} // '';
  my $subscriptions;
  unless (defined ($subscriptions = $cl->{eventSubscriptions}->{$arg})) {
    $subscriptions = [];
    $cl->{eventSubscriptions}->{$arg} = $subscriptions;
  }
  push @$subscriptions,{
    name    => $name,
    type    => $type,
    changed => $changed,
  };
  Log3 ($cl->{SNAME},5,"websocket subscribe for device /$name/, type /$type/, arg '$arg' changed /$changed/");
}

sub unsubscribeEvent($$) {
  my ($cl,$arg) = @_;
  delete $cl->{eventSubscriptions}->{$arg // ''};
  Log3 ($cl->{SNAME},5,"websocket unsubscribe for '$arg'");
}

sub sendTypedMessage($$$) {
  my ($cl,$type,$arg) = @_;
  websocket::sendMessage($cl, type => 'text', buffer => encode_json {
    type => $type,
    payload => $arg,
  });
}

1;

=pod
=begin html

<a name="websocket_json"></a>
<h3>websocket_json</h3>
<ul>
  <br>
  <a name="websocket_jsondefine"></a>
  <b>Define</b>
  <ul>
    <code>define &lt;name&gt; websocket_json [resource]</code><br><br>

    Defines a protocol-handler for json over websocket.<br>
    The optional parameter 'resource' defines an URL-path that this websocket_json<br>
    device should be configured for. e.g. 'define json websocket_json /fhem'<br>
    This way multiple websocket_json-devices may share a single port.<br>
    'resource' defaults to '/'
  </ul>
  <br>

  <a name="websocket_jsonset"></a>
  <b>Set</b> <ul>N/A</ul><br>

  <a name="websocket_jsonget"></a>
  <b>Get</b> <ul>N/A</ul><br>

  <a name="websocket_jsonattr"></a>
  <b>Attributes:</b> <ul>N/A</ul><br>
</ul>

=end html
=cut

1;