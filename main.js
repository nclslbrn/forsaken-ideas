import 'p5/lib/addons/p5.sound';

import * as sketchHooks from './sketch';

// Attach everything that is exported from sketch to window
(w => Object.keys(sketchHooks).forEach(hook => { w[hook] = sketchHooks[hook]; }))(window);
