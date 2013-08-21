pomelo-daemon
========

pomelo-daemon is a daemon service for [pomelo](https://github.com/NetEase/pomelo) to deploy and run
in distributed environment better.  

##Installation
```
npm install -g pomelo-daemon
```
##Usage
Use pomelo-daemon to start pomelo clusters  

- deploy codes in servers 
- config servers.json to the right host instead of '127.0.0.1' etc  
- put daemon.json to the config dir  
daemon.json example
```
{
	"id": "dh37fgj492je",
	"key": "agarxhqb98rpajloaxn34ga8xrunpagkjwlaw3ruxnpaagl29w4rxn",
	"algorithm": "sha256",
	"user": "pomelo"
}
```
note: pomelo-daemon use [hawk](https://github.com/hueniverse/hawk/) to provide safety between servers  
you can modify daemon.json to your own  

- cd to /game-server path  
- in master server, run  
```
pomelo-daemon
```
- in other server, run
```
pomelo-daemon --mode=server
```
note: you can deploy daemon with nohup  
```
nohup pomelo-daemon --mode=server
```

- in master server, pomelo-daemon client, run
```
start all
```

- pomelo clusters are started 

##More Usage
in pomelo-daemon client, type help for more help infomations, enjoy with it  
![pomelo-daemon](http://ww1.sinaimg.cn/large/b7bc844fgw1e7u2sxkvsbj20l70bodhs.jpg)

## License

(The MIT License)

Copyright (c) 2012-2013 NetEase, Inc. and other contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
