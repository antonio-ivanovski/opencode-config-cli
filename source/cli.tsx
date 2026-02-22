#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';
import {cmdGet} from './commands/get.js';
import {cmdDelete} from './commands/delete.js';
import {cmdPath} from './commands/path.js';
import {cmdSet} from './commands/set.js';
import {cmdList} from './commands/list.js';
import {cmdValidate} from './commands/validate.js';

const cli = meow(
	`
  Usage
    $ lazy-opencode-config [command] [args] [flags]

  Commands
    (none)           Launch interactive TUI
    get <path>       Get config value at dot-path
    set <path> <v>   Set config value at dot-path
    delete <path>    Remove config key
    list <what>      List providers, models, agents, keys
    validate         Validate config against schema
    path             Print resolved config file path

  Flags
    --global         Use global config
    --project        Use project config
    --provider       Filter models by provider (used with list models)
    --help           Show help
    --version        Show version
`,
	{
		importMeta: import.meta,
		flags: {
			global: {type: 'boolean', default: false},
			project: {type: 'boolean', default: false},
			provider: {type: 'string'},
		},
	},
);

const [command, ...args] = cli.input;
const scope = cli.flags.global
	? 'global'
	: cli.flags.project
	? 'project'
	: ('auto' as const);

async function run() {
	if (!command) {
		render(<App scope={scope} />);
		return;
	}

	try {
		let result: string;

		switch (command) {
			case 'get': {
				const dotPath = args[0];
				if (!dotPath) {
					process.stderr.write('Error: get requires a path argument\n');
					process.exit(1);
				}

				result = await cmdGet(dotPath, scope);
				break;
			}

			case 'set': {
				const dotPath = args[0];
				const rawValue = args[1];
				if (!dotPath || rawValue === undefined) {
					process.stderr.write(
						'Error: set requires a path and value argument\n',
					);
					process.exit(1);
				}

				result = await cmdSet(dotPath, rawValue, scope);
				break;
			}

			case 'delete': {
				const dotPath = args[0];
				if (!dotPath) {
					process.stderr.write('Error: delete requires a path argument\n');
					process.exit(1);
				}

				result = await cmdDelete(dotPath, scope);
				break;
			}

			case 'list': {
				const resource = args[0];
				if (!resource) {
					process.stderr.write(
						'Error: list requires a resource argument (providers, models, agents, keys)\n',
					);
					process.exit(1);
				}

				result = await cmdList(resource, scope, {
					provider: cli.flags.provider,
				});
				break;
			}

			case 'validate': {
				result = await cmdValidate(scope);
				break;
			}

			case 'path': {
				result = await cmdPath(scope);
				break;
			}

			default: {
				process.stderr.write(`Error: Unknown command "${command}"\n`);
				process.exit(1);
			}
		}

		process.stdout.write(`${result}\n`);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		process.stderr.write(`Error: ${message}\n`);
		process.exit(1);
	}
}

await run();
