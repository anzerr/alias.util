
const path = require('path'),
	fs = require('fs');

const Module = module.constructor.length > 1 ? module.constructor : require('module');

const get = (file, o, func = require) => {
	let options = o || [path.join(__dirname, '../..'), process.cwd()];
	for (let i in options) {
		try {
			let p = path.join(options[i], file);
			return [func(p), p];
		} catch(e) {
			// nothign
		}
	}
	return null;
};

let setup = 0;

class Alias {

	constructor(alias) {
		if (setup > 0) {
			throw new Error('Alias has been inited more then once that will overide');
		}
		setup++;
		this.old = {
			_nodeModulePaths: Module._nodeModulePaths,
			_resolveFilename: Module._resolveFilename
		};
		this.alias = [];
		for (let i in alias) {
			this.add(i, alias[i]);
		}
		this.base = null;

		const self = this;
		Module._nodeModulePaths = function(from) {
			let paths = self.old._nodeModulePaths.call(this, from);
			return paths;
		};
		Module._resolveFilename = function(request, parentModule, isMain, options) {
			if (!self.base) {
				let o = [];
				for (let i in parentModule.paths) {
					o.push(path.join(parentModule.paths[i], '..'));
				}
				self.base = get('package.json', o, fs.accessSync)[1].replace(/package.json$/, '');
			}
			for (let i in self.alias) {
				if (request.match(self.alias[i].reg)) {
					let target = self.alias[i].path;
					if (typeof self.alias[i].path === 'function') {
						target = self.alias[i].path(parentModule.filename, request, alias);
						if (!target || typeof aliasTarget !== 'string') {
							throw new Error('Expecting custom handler function to return path.');
						}
					}
					request = path.join(self.base, target, request.replace(self.alias[i].reg, ''));
					break;
				}
			}
			return self.old._resolveFilename.call(this, request, parentModule, isMain, options);
		};
	}

	remove() {
		setup = 0;
		Module._nodeModulePaths = this.old._nodeModulePaths;
		Module._resolveFilename = this.old._resolveFilename;
		return this;
	}

	add(r, p) {
		this.alias.push({reg: new RegExp(r), path: p});
		return this;
	}

}

module.exports = {
	typescript: () => {
		let tsconfig = get('tsconfig.json')[0];
		if (!tsconfig) {
			throw new Error('failed to find tsconfig');
		}
		let p = {};
		for (let i in tsconfig.compilerOptions.paths) {
			p[i.replace(/[\/\\]\*$/, '')] = path.join(tsconfig.compilerOptions.outDir || '', tsconfig.compilerOptions.paths[i][0].replace(/[\/\\]\*$/, '/'));
		}
		return new Alias(p);
	},
	package: () => {
		let pack = get('package.json')[0];
		if (!pack) {
			throw new Error('failed to find package');
		}
		return new Alias(pack.pathAlias || pack._moduleAliases || {});
	},
	Alias: Alias
};
