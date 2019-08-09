
### `Intro`
Add alias to require and import. the typescript compiler doesn't transform alias paths

#### `Install`
``` bash
npm install --save git+https://git@github.com/anzerr/alias.util.git
npm install --save @anzerr/alias.util
```

### `Example`
``` javascript
require('alias.util').typescript();
require('@modules/index.js');
require('@test/sub/index.js');

require('alias.util').package();
require('@modules/index.js');
require('@test/sub/index.js');

const {Alias} = require('alias.util');
new Alias({
	'@modules': 'test/sub',
});
require('@modules/index.js');
```