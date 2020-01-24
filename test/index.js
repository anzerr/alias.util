
const assert = require('assert');

const clear = () => {
	let o = [];
	for (let i in require.cache) {
		if (i.match('test\\\\sub\\\\index.js')) {
			delete require.cache[i];
		} else {
			o.push(i);
		}
	}
	console.log(o);
};

clear();
let ts = require('../index.js').typescript();
assert.equal(require('@modules/index.js'), 'cat');
assert.equal(require('@test/sub/index.js'), 'cat');

try {
	require('../index.js').package();
} catch(e) {
	assert.equal(e.toString(), 'Error: Alias has been inited more then once that will overide');
}
ts.remove();

clear();
let pack = require('../index.js').package();
assert.equal(require('@modules/index.js'), 'cat');
assert.equal(require('@test/sub/index.js'), 'cat');
pack.remove();

clear();
const {Alias} = require('../index.js');
new Alias({
	'@modules': 'test/sub',
});
assert.equal(require('@modules/index.js'), 'cat');
try {
	require('@test/sub/index.js');
} catch(e) {
	assert.notEqual(e.toString().match('Error: Cannot find module \'@test/sub/index.js\''), null);
}
