const Express = require('express');
const EventEmitter = require('events');

const Components = require('./components');
const info = require('./package');
const { log } = require('./helper');

module.exports = class App {
  constructor(config) {
    const express = Express();
    this.config = config;
    this.version = info.version;
    this.gitVersion = '';
    this.rootDir = config.rootDir;

    try {
      const git = require('git-rev-sync');
      this.gitVersion = git.short();
    } catch (e) {
      // continue
    }
    // this.swaggerDefinition = {};
    const events = new EventEmitter();
    this.on = events.on;
    this.emit = events.emit;

    new Components({ express, config, info, nofy: this }).init();

    return this;
  }

  printInfo() {
    log(`   Version :: ${this.version}-${this.gitVersion}\n`);

    if (this.controllers) {
      log(`   Controllers::`);
      Object.keys(this.controllers).map((cName) => {
        log(`    - ${cName}`);
      });
      log('');
    }

    if (this.models) {
      log(`   Models::`);
      Object.keys(this.models).map((mName) => {
        log(`    - ${mName}`);
      });
      log('');
    }

    if (this.queue) {
      log(`   Queue::`);
      Object.keys(this.queue).map((qName) => {
        log(`    - ${qName}`);
      });
      log('');
    }

    console.log('')
  }
};