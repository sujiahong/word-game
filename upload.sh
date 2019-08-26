#!/usr/bin/expect -f
set ip 192.168.10.34
set pw "123456"
set dir /home/sujiahong/workspace/aa-server/servers/download-server/assets/hotupdate
set timeout 5
spawn scp ./remote-assets/update.tar root@$ip:$dir
expect "yes/no" {send "yes\r"} "password" {send "$pw\r"}
send "exit \r"
expect eof

sleep 1

spawn ssh -t root@$ip
expect "yes/no" {send "yes\r"} "password" {send "$pw\r"}
expect "#"
send "cd $dir \r"
send "tar -xvzf update.tar -C ./ \r"
expect eof