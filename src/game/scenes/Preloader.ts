import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class Preloader extends Scene {

    private loadText: any;
    constructor() {
        super('Preloader');
    }

    init() {

    }

    preload() {
        // main
        this.load.setPath('assets/game');
        this.load.image('game-cat', 'game-cat.png')
        this.load.image('cat', 'cat.png')
        this.load.image('unit', 'unit.png')
        this.load.image('freezeBg', 'freezeBg.png')
        this.load.image('boomBg', 'boomBg.png')
        this.load.image('freeze', 'freeze.gif')
        this.load.image('boom', 'boom.png')
    }

    create() {
        EventBus.emit('current-scene-ready', this);

        this.scene.start('MainGame');
    }
}
