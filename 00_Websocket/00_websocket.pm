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
use TcpServerUtils;

my @clients = qw(
  websocket_fhem
  websocket_json
);

##########################
sub
websocket_Initialize($)
{
  my ($hash) = @_;

  # Provider
  $hash->{Clients} = join (':',@clients);
  $hash->{DefFn}    = "websocket::Define";
  $hash->{ReadFn}   = "websocket::Read";
  $hash->{UndefFn}  = "websocket::Undef";
  $hash->{AttrFn}   = "websocket::Attr";
  $hash->{NotifyFn} = "websocket::Notify";
  $hash->{AttrList} = "allowfrom SSL timeout";
}

package websocket;

use strict;
use warnings;

use GPUtils qw(:all);

use Protocol::WebSocket::Handshake::Server;

use Data::Dumper;

BEGIN {GP_Import(qw(
  TcpServer_Open
  TcpServer_Accept
  TcpServer_SetSSL
  TcpServer_Close
  RemoveInternalTimer
  InternalTimer
  AnalyzeCommand
  AnalyzeCommandChain
  AttrVal
  CommandDelete
  Log3
  gettimeofday
  devspec2array
  IsIgnored
  getAllSets
  getAllGets
  getAllAttr
))};

##########################
sub Define($$$)
{
  my ($hash, $def) = @_;

  my ($name, $type, $port, $global) = split("[ \t]+", $def);

  my $isServer = 1 if(defined($port) && $port =~ m/^(IPV6:)?\d+$/);
  
  return "Usage: define <name> websocket { [IPV6:]<tcp-portnr> [global] }"
        if(!($isServer) ||
            ($global && $global ne "global"));

  $hash->{port} = $port;
  $hash->{global} = $global;
  $hash->{NOTIFYDEV} = 'global';
  $hash->{onopen} = {};
  $hash->{onclose} = {};

  if ($main::init_done) {
    Init($hash);
  }
}

sub Init($) {
  my ($hash) = @_;
  if (my $ret = TcpServer_Close($hash)) {
    Log3 ($hash->{NAME}, 1, "websocket failed to close port: $ret");
  } elsif ($ret = TcpServer_Open($hash, $hash->{port}, $hash->{global})) {
    Log3 ($hash->{NAME}, 1, "websocket failed to open port: $ret");
  }
}

##########################
sub Read($) {
  my ($hash) = @_;
  my $name = $hash->{NAME};
  if($hash->{SERVERSOCKET}) {   # Accept and create a child
    my $chash = TcpServer_Accept($hash, "websocket");
    return if(!$chash);
    $chash->{hs} = Protocol::WebSocket::Handshake::Server->new;
    $chash->{ws} = 'new';
    $chash->{timeout} = AttrVal($name,"timeout",30);
    $chash->{pong_received} = 1;
    $chash->{ontextmessage} = {};
    $chash->{onbinarymessage} = {};
    $chash->{SSL} = $hash->{SSL};
    return;
  }

  my $cl = $hash; # $hash is master device, $cl is open client
  my $c = $cl->{CD};
  my $buf;
  my $ret = sysread($c, $buf, 256);

  if(!defined($ret) || $ret <= 0) {
    CommandDelete(undef, $name);
    return;
  }

  my $sname = $cl->{SNAME};
  Log3 ($sname,5,$buf);

  $cl->{BUF} .= $buf;
  if($cl->{SSL} && $c->can('pending')) {
    while($c->pending()) {
      sysread($c, $buf, 256);
      Log3 ($sname,5,$buf);
      $cl->{BUF} .= $buf;
    }
  }

  if ($cl->{ws} eq 'new') {
    unless ($cl->{hs}->parse($cl->{BUF}) and $cl->{hs}->is_done) {
      Log3 ($sname,5,$cl->{hs}->error) if ($cl->{hs}->error);
      #closeSocket($cl);
      return;
    }
    #Log3 ($sname,5,Dumper($cl->{hs}));
    Log3 ($sname,5,$cl->{hs}->to_string);
    $cl->{resource} = $cl->{hs}->req->resource_name;
    $cl->{protocols} = [split "[ ,]",$cl->{hs}->req->subprotocol];
    if ($hash = $main::defs{$sname}) {
      foreach my $arg (keys %{$hash->{onopen}}) {
        my $protocol = eval {
          return &{$hash->{onopen}->{$arg}->{fn}}($cl,$hash->{onopen}->{$arg}->{arg},$cl->{resource},@{$cl->{protocols}});
        };
        Log3 ($sname,4,"websocket: ".GP_Catch($@)) if $@;
        if (defined $protocol) {
          Log3 ($sname,4,"websocket: protocol chosen '$protocol'");
          $cl->{hs}->res->subprotocol($protocol);
          $cl->{protocol} = $protocol;
          last;
        }
      }
    }
    syswrite($cl->{CD},$cl->{hs}->to_string);
    $cl->{ws} = 'open';
    $cl->{frame} = $cl->{hs}->build_frame;
    Timer($cl);
  }

  if ($cl->{ws} eq 'open') {
    my $frame = $cl->{frame};
    $frame->append($cl->{BUF});
    while (defined(my $message = $frame->next)) {
      MESSAGE: {
        $frame->is_continuation and do {
          Log3 ($sname,5,"websocket continuation $message");
          last;
        };
        $frame->is_text and do {
          Log3 ($sname,5,"websocket text $message");
          foreach my $arg (keys %{$cl->{ontextmessage}}) {
            eval {
              &{$cl->{ontextmessage}->{$arg}->{fn}}($cl,$cl->{ontextmessage}->{$arg}->{arg},$message);
            };
            Log3 ($sname,4,"websocket: ".GP_Catch($@)) if $@;
          }
          last;
        };
        $frame->is_binary and do {
          Log3 ($sname,5,"websocket binary $message");
          foreach my $arg (keys %{$cl->{onbinarymessage}}) {
            eval {
              &{$cl->{onbinarymessage}->{$arg}->{fn}}($cl,$cl->{onbinarymessage}->{$arg}->{arg},$message);
            };
            Log3 ($sname,4,"websocket: ".GP_Catch($@)) if $@;
          }
          last;
        };
        $frame->is_ping and do {
          Log3 ($sname,5,"websocket ping $message");
          last;
        };
        $frame->is_pong and do {
          Log3 ($sname,5,"websocket pong $message");
          $cl->{pong_received} = 1;
          last;
        };
        $frame->is_close and do {
          Log3 ($sname,5,"websocket close $message");
          closeSocket($cl);
          last;
        };
      }
    }
  }
}

##########################
sub Attr(@)
{
  my @a = @_;
  my $hash = $main::defs{$a[1]};

  if($a[0] eq "set" && $a[2] eq "SSL") {
    TcpServer_SetSSL($hash);
    if($hash->{CD}) {
      my $ret = IO::Socket::SSL->start_SSL($hash->{CD});
      Log3 $a[1], 1, "$hash->{NAME} start_SSL: $ret" if($ret);
    }
  }
  return undef;
}

sub Undef($$) {
  my ($hash, $arg) = @_;
  return TcpServer_Close($hash);
}

sub Notify() {
  my ($hash,$dev) = @_;
  my $name = $hash->{NAME};

  if( grep(m/^(INITIALIZED|REREADCFG)$/, @{$dev->{CHANGED}}) ) {
    Init($hash);
  } elsif( grep(m/^SAVE$/, @{$dev->{CHANGED}}) ) {
  }
}

sub Timer($) {
  my $cl = shift;
  RemoveInternalTimer($cl);
  unless ($cl->{pong_received}) {
    Log3 ($cl->{NAME},3,"websocket $cl->{NAME} disconnect due to timeout");
    closeSocket($cl);
    return undef;
  }
  $cl->{pong_received} = 0;
  InternalTimer(gettimeofday()+$cl->{timeout}, "websocket::Timer", $cl, 0);
  sendMessage($cl,type => 'ping');
}

sub closeSocket($) {
  my ($cl) = @_;
  # Send close frame back
  sendMessage($cl, type => 'close');
  TcpServer_Close($cl);
  RemoveInternalTimer($cl);
  my $sname = $cl->{SNAME};
  if (my $hash = $main::defs{$sname}) {
    foreach my $arg (keys %{$hash->{onclose}}) {
      eval {
        &{$hash->{onclose}->{$arg}->{fn}}($cl,$hash->{onclose}->{$arg}->{arg});
      };
      Log3 ($sname,4,"websocket: ".GP_Catch($@)) if $@;
    }
  }
  CommandDelete(undef, $cl->{NAME});
}

sub sendMessage($%) {
  my ($cl,%msg) = @_;
  Log3 ($cl->{SNAME},5,Dumper(\%msg));
  eval {
    syswrite($cl->{CD}, $cl->{hs}->build_frame(%msg)->to_bytes);
  };
  if($@) {
    Log3 ($cl->{SNAME},1,"ERROR sendMessage [$@]\n");
  }
}

# these are master hash API methods:
sub subscribeOpen($$$) {
  my ($hash,$fn,$arg) = @_;
  $hash->{onopen}->{$arg} = {
    fn  => $fn,
    arg => $arg,
  };
  Log3 ($hash->{NAME},5,"websocket subscribeOpen $fn");
}

sub unsubscribeOpen($$) {
  my ($hash,$arg) = @_;
  my $deleted = (delete $hash->{onopen}->{$arg}) // "- undefined -";
  Log3 ($hash->{NAME},5,"websocket unsubscribeOpen");
}

sub subscribeClose($$$) {
  my ($hash,$fn,$arg) = @_;
  $hash->{onclose}->{$arg} = {
    fn  => $fn,
    arg => $arg,
  };
  Log3 ($hash->{NAME},5,"websocket subscribeClose $fn");
}

sub unsubscribeClose($$) {
  my ($hash,$arg) = @_;
  my $deleted = (delete $hash->{onclose}->{$arg}) // "- undefined -";
  Log3 ($hash->{NAME},5,"websocket unsubscribeClose");
}

# these are client hash API methods:

sub subscribeTextMessage($$$) {
  my ($cl,$fn,$arg) = @_;
  $cl->{ontextmessage}->{$arg} = {
    fn  => $fn,
    arg => $arg,
  };
  Log3 ($cl->{SNAME},5,"websocket subscribeTextMessage $fn");
}

sub unsubscribeTextMessage($$) {
  my ($cl,$arg) = @_;
  my $deleted = (delete $cl->{ontextmessage}->{$arg}) // "- undefined -";
  Log3 ($cl->{SNAME},5,"websocket unsubscribeTextMessage");
}

sub subscribeBinaryMessage($$$) {
  my ($cl,$fn,$arg) = @_;
  $cl->{onbinarymessage}->{$arg} = {
    fn  => $fn,
    arg => $arg,
  };
  Log3 ($cl->{SNAME},5,"websocket subscribeBinaryMessage $fn");
}

sub unsubscribeBinaryMessage($$) {
  my ($cl,$arg) = @_;
  my $deleted = (delete $cl->{onbinarymessage}->{$arg}) // "- undefined -";
  Log3 ($cl->{SNAME},5,"websocket unsubscribeBinaryMessage");
}

1;

=pod
=begin html

<a name="websocket"></a>
<h3>websocket</h3>
<ul>
  <br>
  <a name="websocketdefine"></a>
  <b>Define</b>
  <ul>
    <code>define &lt;name&gt; websocket &lt;portNumber&gt; [global]</code><br>
    <br><br>

    Listen on the TCP/IP port <code>&lt;portNumber&gt;</code> for incoming
    websocket connections. If the second parameter global is <b>not</b> specified,
    the server will only listen to localhost connections.
    <br>
    To use IPV6, specify the portNumber as IPV6:&lt;number&gt;, in this
    case the perl module IO::Socket:INET6 will be requested.
    On Linux you may have to install it with cpan -i IO::Socket::INET6 or
    apt-get libio-socket-inet6-perl; OSX and the FritzBox-7390 perl already has
    this module.<br>
    Examples:
    <ul>
        <code>define wsPort websocket 7072 global</code><br>
        <code>attr wsPort SSL</code><br>
    </ul>
  </ul>
  <br>

  <a name="websocketset"></a>
  <b>Set</b> <ul>N/A</ul><br>

  <a name="websocketget"></a>
  <b>Get</b> <ul>N/A</ul><br>

  <a name="websocketattr"></a>
  <b>Attributes:</b>
  <ul>
    <a name="SSL"></a>
    <li>SSL<br>
        Enable SSL encryption of the connection, see the description <a
        href="#HTTPS">here</a> on generating the needed SSL certificates. To
        connect to such a port you need to specify wss:// as protocol in URL
        to connect the websocket to.
        </li><br>

    <a name="allowfrom"></a>
    <li>allowfrom<br>
        Regexp of allowed ip-addresses or hostnames. If set,
        only connections from these addresses are allowed.
        </li><br>

    <a name="timeout"></a>
    <li>timeout<br>
        ping the remote-side after this many seconds. Close connection if there's no reponse.
        Default is 30.
        </li><br>

  </ul>

</ul>

=end html
=cut

1;