var consts = {};

module.exports = consts;

consts.WELCOME_INFO = ["\nWelcome to the Pomelo daemon.",
		"Pomelo is a fast, scalable game server framework for node.js. ",
		"Type \'help\' for help information.\n"
];

consts.HELP_INFO_1 = [
		"\nFor information about Pomelo products and services, visit:",
		"   http://pomelo.netease.com/",
		"\nList of all Pomelo daemon commands:\n"
];

consts.HELP_INFO_2 = [
		"\nFor more command usage, type : help command",
		"example: help start\n"
];

consts.HELP_LOGIN = [
	"\nWelcome to the Pomelo daemon.",
	"Pomelo is a fast, scalable game server framework for node.js. ",
	"Usage: pomelo-daemon [options]\n",
	"-h, --help                  display this help",
	"-p, -P port                 set daemon server listening port ",
	"--log                       start daemon log collector",
	"--debug                     running in debug mode",
	"--mode=[client|server]      start daemon in client|server mode, default mode is client",
	"--pattern=pattern           daemon log collector pattern, default is \'rpc-log\'\n"
];

consts.COMANDS_ALL = [
	["command", "  distription"],
	["?", "  symbol for help"],
	["help", "  display this help"],
	["kill", "  kill pomeo server through daemon"],
	["start", "  start pomelo server through daemon"]
];

consts.COMANDS_MAP = {
	"help": 1,
	"kill": ["\nkill pomeo server through daemon",
			"example: kill <serverId> <serverType> <environment>",
			"example: kill all <environment>",
			"note: in pomelo serverId has the style of serverType-server-num",
			"so you can using following commands also",
			"start area-server-1",
			"start connector-server-1",
			"default environment is development\n"
	],
	"start": ["\nstart pomelo server through daemon",
			"example: start <serverId> <serverType> <environment>",
			"example: start all <environment>",
			"note: in pomelo serverId has the style of serverType-server-num",
			"so you can using following commands also",
			"start area-server-1",
			"start connector-server-1",
			"default environment is development\n"
	]
};

consts.LOAD_ERROR = "Change your path to pomelo start path to load config files.\n";

consts.COMANDS_LOAD_ERROR = "\ncommands load error: can not load path";
consts.COMANDS_START_MASTER_ERROR = "\nstart master error : no such master with this id\n";
consts.COMANDS_START_SERVER_ERROR = "\nstart server error : no such server with this id\n";
consts.COMANDS_START_ALL_ERROR = "\nstart all error : no such env\n";
consts.COMANDS_START_MASTER_OK = "start master ok";
consts.COMANDS_KILL_MASTER_ERROR = "\nkill master error : no such master with this id\n";
consts.COMANDS_KILL_SERVER_ERROR = "\nkill server error : no such server with this id\n";
consts.COMANDS_KILL_ALL_ERROR = "\nkill all error : no such env\n";
consts.COMANDS_KILL_MASTER_OK = "kill master ok";

consts.DAEMON_EXT = "pomelo-daemon";

consts.START_MASTER_TIMEOUT = 3000;
consts.START_DAEMON_TIMEOUT = 1000;