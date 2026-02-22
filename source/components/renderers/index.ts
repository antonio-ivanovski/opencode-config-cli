import {
	registerTypeRenderer,
	registerPathOverride,
} from '../../lib/renderer-registry.js';
import BooleanRenderer from './BooleanRenderer.js';
import EnumRenderer from './EnumRenderer.js';
import TextRenderer from './TextRenderer.js';
import NumberRenderer from './NumberRenderer.js';
import ModelPicker from './ModelPicker.js';
import ArrayRenderer from './ArrayRenderer.js';

// Register type renderers
registerTypeRenderer('boolean', BooleanRenderer);
registerTypeRenderer('enum', EnumRenderer);
registerTypeRenderer('mixed', EnumRenderer); // mixed types (like autoupdate) use enum renderer
registerTypeRenderer('string', TextRenderer);
registerTypeRenderer('number', NumberRenderer);
registerTypeRenderer('array', ArrayRenderer);

// Register path overrides
registerPathOverride('model', ModelPicker);
registerPathOverride('small_model', ModelPicker);
registerPathOverride('agent.*.model', ModelPicker);

export {
	BooleanRenderer,
	EnumRenderer,
	TextRenderer,
	NumberRenderer,
	ModelPicker,
	ArrayRenderer,
};
