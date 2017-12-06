# Node Express API Broilerplate
The Node Express API Broilerplate.

Run ```npm install``` to install the required packages.

To launch the API using your local environment:

	node api.js local

## PM2 Setup

https://github.com/Unitech/pm2

I'm somewhat following this guide for setting things up via pm2:

https://www.digitalocean.com/community/tutorials/how-to-use-pm2-to-setup-a-node-js-production-environment-on-an-ubuntu-vps

First, we do this so we do not have to be sudo to run an app on port 80.


	sudo apt-get install libcap2-bin
	sudo setcap cap_net_bind_service=+ep /usr/bin/nodejs


Currently, our pm2 setup is very simple. Set `port` to 80 in `config.js`. Then, we install pm2 this way:

	sudo npm install -g pm2

We want pm2 to be a daemon and restart our app if it crashes or if the server restarts:

	sudo su -c "env PATH=$PATH:/usr/bin pm2 startup linux -u ubuntu"

Then vim into `/etc/init.d/pm2-init.sh` and change `PM2_HOME` to `/home/ubuntu/.pm2`. I know, it's werid, but it works.

Then we want to start the app in pm2. We are using a json file to store all the applications
running on the server. The json file is stored at home/ubuntu/processes.json
and looks similar to the below. Note the different directories for each branch (environment):

```
{
  "apps" : [{
    "name": "node-express-api",
    "script"    : "node-express-api/API/api.js",
    "instances" : 3,
    "exec_mode" : "cluster"
	"args"	: ["production"],
    "node_args" : ["production"],
    "env"       : {
       "NODE_ENV":"production"
    }
  },
  {
    "name": "stage-node-express-api",
    "script"    : "stage-node-express-api/API/api.js stage",
    "instances" : 3,
    "exec_mode" : "cluster",
    "args"	: ["stage"],
    "node_args" : ["stage"],
    "env"       : {
       "NODE_ENV":"stage"
    }
  }]
}
```

To reload this file:

	pm2 reload processes.json

To stop all process:

	pm2 stop all

To restart one application "node-express-api":

	pm2 restart node-express-api

To delete one application "node-express-api":

	pm2 delete node-express-api

If you want to update to the latest commit and redeploy on **stage**:

	cd /home/ubuntu/stage-node-express-api/
	git pull origin stage
	pm2 restart stage-node-express-api

If you want to update to the latest commit and redeploy on **production**:

	cd /home/ubuntu/node-express-api/
	git pull origin master
	pm2 restart node-express-api
