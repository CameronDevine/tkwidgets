'use strict';

require('./test-utils.js');

const tk = require('terminal-kit');

const termutils = require('./framework/termutils.js');
const Renderer = require('./framework/Renderer.js');

const BaseWidget = require('./BaseWidget.js');
const ListWidget = require('./ListWidget.js');
const TextWidget = require('./TextWidget.js');
const ConsoleWidget = require('./ConsoleWidget.js');
const HLayoutWidget = require('./HLayoutWidget.js');
const VLayoutWidget = require('./VLayoutWidget.js');
const RootWidget = require('./RootWidget.js');
const WindowWidget = require('./WindowWidget.js');
const markdownRenderer = require('./framework/markdownRenderer.js');
const TermWrapper = require('./framework/TermWrapper.js');

class DebugWidget extends TextWidget {

	async onWillRender() {
		this.text = this.fullName;
	}

}

function newDebugWidget(name) {
	const w = new DebugWidget();
	w.name = name;
	w.style = {
		borderBottomWidth: 1,
		borderTopWidth: 1,
		borderLeftWidth: 1,
		borderRightWidth: 1,
	};
	return w;
}

function main() {
	const w1 = newDebugWidget('w1');
	const w2 = newDebugWidget('w2');
	const w3 = newDebugWidget('w3');
	const w4 = newDebugWidget('w4');

	const layout1 = new VLayoutWidget();
	layout1.name = 'layout1';
	layout1.addChild(w1, { type: 'stretch', 'factor': 1 });
	layout1.addChild(w2, { type: 'stretch', 'factor': 1 });

	const layout2 = new HLayoutWidget();
	layout2.name = 'layout2';
	layout2.addChild(w3, { type: 'stretch', 'factor': 1 });
	layout2.addChild(w4, { type: 'stretch', 'factor': 1 });
	layout2.addChild(layout1, { type: 'stretch', 'factor': 2 });

	const win = new WindowWidget();
	win.addChild(layout2);

	const rootWidget = new RootWidget();
	rootWidget.addChild(win);

	const term = new TermWrapper(tk.terminal);

	const renderer = new Renderer(term, rootWidget);
	renderer.start();

	const fullScreen = (enable = true) => {
		if (enable) {
			term.fullscreen();
			term.hideCursor();
		} else {
			term.fullscreen(false);
			term.showCursor();
		}
	}

	term.grabInput();

	fullScreen();

	term.on('key', async (name, matches, data) => {
		if (name === 'CTRL_D' || name === 'CTRL_C') {
			fullScreen(false);
			process.exit();
			return;
		}
	});

	process.on('unhandledRejection', (reason, p) => {
		fullScreen(false);
		console.error('Unhandled promise rejection', p, 'reason:', reason);
		process.exit(1);
	});	
}

main();