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
sub websocket_fhem_Initialize($) {
  my ($hash) = @_;

  # Provider
  $hash->{DefFn}    = "websocket_fhem::Define";
  $hash->{NotifyFn} = "websocket_fhem::Notify";
  $hash->{AttrList} = "IODev";
  
  main::LoadModule("websocket");
}

package websocket_fhem;

use strict;
use warnings;

use GPUtils qw(:all);

BEGIN {GP_Import(qw(
  AssignIoPort
  Log3
))};

##########################
sub Define($$$) {
  my ($hash, $def) = @_;

  return "Usage: define <name> websocket_fhem" if (split("[ \t][ \t]*", $def) != 2);

  $hash->{NOTIFYDEV} = '';
  $hash->{websockets} = [];

  if ($main::init_done) {
    Init($hash);
  }
}

sub Init($) {
  my ($hash) = @_;
  AssignIoPort($hash);
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
    foreach my $name (keys %{$hash->{inform}}) {
      foreach my $c (keys %inform) {
        my $dc = $defs{$c};
        if(!$dc || $dc->{NR} != $inform{$c}{NR}) {
          delete($inform{$c});
          next;
        }
        next if($inform{$c}{type} eq "raw");
        my $tn = TimeNow();
        if($attr{global}{mseclog}) {
          my ($seconds, $microseconds) = gettimeofday();
          $tn .= sprintf(".%03d", $microseconds/1000);
        }
        my $re = $inform{$c}{regexp};
        foreach my $state ($dev->{CHANGED}) {
          next if($re && !($dev =~ m/$re/ || "$dev:$state" =~ m/$re/));
          websocket::sendMessage($dc, type => 'text', buffer => ($inform{$c}{type} eq "timer" ? "$tn " : "")."$hash->{TYPE} $dev $state\n");
        }
      }
    }
  }
}

# these are websocket-protocol callback methods:

sub onSocketConnected($$$@) {
  my ($cl,$hash,$resource,@protocols) = @_;
  if (grep (/^fhem$/,@protocols)) {
    websocket::subscribeTextMessage($cl,\&onFhemMessage,$cl);
    push @{$hash->{websockets}},$cl;
    return 'fhem';
  } else {
    return undef;
  }
}

sub onSocketClosed($$) {
  my ($cl,$hash) = @_;
  $hash->{websockets} = [grep {$_ != $cl} @{$hash->{websockets}}];
}


sub onMessage($$$) {
  my ($cl,$hash,$message) = @_;
  #inform {on|off|timer|raw} [regexp]
  if ($message =~ /^inform /) {
    my ($cmd,$type,$regexp) = split("[ \t]+", $message);
    if($type =~ m/^(on|off|raw|timer)$/) {
      my $name = $cl->{NAME};
      delete($hash->{inform}->{$name});
      if($type ne 'off') {
        $hash->{inform}->{$name}->{NR} = $cl->{NR};
        $hash->{inform}->{$name}->{type} = $type;
        $hash->{inform}->{$name}->{regexp} = $regexp;
      }
    }
  } else {
    my $ret = AnalyzeCommandChain($cl, $message);
    sendMessage($cl, type => 'text', buffer => $ret) if (defined $ret);
  }
}

1;

=pod
=begin html

<a name="websocket_fhem"></a>
<h3>websocket_fhem</h3>
<ul>
  <br>
  <a name="websocket_fhemdefine"></a>
  <b>Define</b>
  <ul>
    <code>define &lt;name&gt; websocket_fhem</code><br><br>

    Defines a protocol-handler for json over websocket
  </ul>
  <br>

  <a name="websocket_fhemset"></a>
  <b>Set</b> <ul>N/A</ul><br>

  <a name="websocket_fhemget"></a>
  <b>Get</b> <ul>N/A</ul><br>

  <a name="websocket_fhemattr"></a>
  <b>Attributes:</b> <ul>N/A</ul><br>
</ul>

=end html
=cut

1;