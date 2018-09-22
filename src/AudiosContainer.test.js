import { expect } from 'chai';
import sinon from 'sinon';
import Datauri from 'datauri';
import { Howler } from 'howler';
import 'web-audio-test-api';
import AudiosContainer from './AudiosContainer';

const fs = require('fs');
const path = require('path');

const datauri = new Datauri();
const buffer = fs.readFileSync(path.resolve(__dirname, 'testmedia', 'test-audio.mp3'));
datauri.format('.mp3', buffer);
const MP3audio64uri = datauri.content;

const buffer2 = fs.readFileSync(path.resolve(__dirname, 'testmedia', 'test-audio.flac'));
datauri.format('.flac', buffer2);
const FLACaudio64uri = datauri.content;

const buffer3 = fs.readFileSync(path.resolve(__dirname, 'testmedia', 'test-audio.ogg'));
datauri.format('.ogg', buffer3);
const OGGaudio64uri = datauri.content;

const audiofile = {
  id: 1,
  _id: 1,
  mp3: MP3audio64uri,
  flac: FLACaudio64uri,
  ogg: OGGaudio64uri,
  originalFile: {
    filename: 'My Cool Audio.wav',
    metadata: {
      duration: 34,
    },
  },

};

describe('PlayerContainer', () => {
  let ac;
  let sandbox;

  beforeEach(() => {
    ac = new AudiosContainer(false);
    sandbox = sinon.createSandbox();

    sandbox.stub(ac, 'buildURL').callsFake(format => audiofile[format]);

    Howler.codecs = jest.fn().mockReturnValue({
      mp3: true,
      mpeg: false,
      opus: false,
      ogg: true,
      oga: false,
      wav: false,
      aac: false,
      caf: false,
      m4a: false,
      mp4: false,
      weba: false,
      webm: false,
      dolby: false,
      flac: true,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should load PlayerContainer in default state', () => {
    expect(ac.state.sound).to.equal(undefined);
  });

  describe('LOAD', () => {
    it('should load a base 64 audio URI', (done) => {
      ac.loadSound(audiofile, 'fakeToken').then(() => {
        expect(ac.state.sound.state()).to.equal('loaded');
        done();
      }).catch((reason) => {
        console.log('The reason is you', reason);
        done();
      });
    }, 1000);

    it('should play a file when sound is LOADED without loading sound', (done) => {
      ac.state.audiofileId = 1; // simulates a loaded file
      ac.loadSound(audiofile, 'fakeToken').then(() => {
        const spy = sinon.spy(ac, 'loadSound');
        ac.play(audiofile, 'fakeToken').then(() => {
          expect(spy).to.have.property('callCount', 0);
          done();
        });
      });
    }, 1000);

    it('should load a url via string', (done) => {
      ac.loadSound('https://api.sound.farm/test/mp3', 'fakeToken').then(() => {
        expect(ac.state.sound.state()).to.equal('loaded');
        done();
      }).catch((reason) => {
        console.log('The reason is you', reason);
        done();
      });
    }, 1000);
  });

  it('should play a file when sound is unloaded', (done) => {
    ac.seek = sandbox.stub();
    ac.play(audiofile, 'fakeToken').then(() => {
      expect(ac.seek).to.have.property('callCount', 1);
      expect(ac.state.url).to.equal(OGGaudio64uri);
      done();
    });
  }, 1000);

  it('should play an MP3 file when OGG isnt supported', (done) => {
    ac.state.format = 'mp3';
    ac.seek = sandbox.stub();
    ac.play(audiofile, 'fakeToken').then(() => {
      expect(ac.seek).to.have.property('callCount', 1);
      expect(ac.state.url).to.equal(MP3audio64uri);
      done();
    });
  }, 1000);

  it('should seek to a position', (done) => {
    ac.play(audiofile, 'fakeToken', 5).then(() => {
      expect(ac.state.url).to.equal(OGGaudio64uri);
      expect(ac.state.currentTime).to.equal(5);
      done();
    });
  }, 1000);

  it('should set state of additional params', (done) => {
    ac.seek = sandbox.stub();
    ac.play(audiofile, 'fakeToken').then(() => {
      expect(ac.state.url).to.have.equal(audiofile.ogg);
      expect(ac.state.filename).to.have.equal(audiofile.originalFile.filename);
      expect(ac.state.audiofileId).to.have.equal(audiofile.id);
      done();
    });
  }, 1000);
});

it('should load a file if play request is made on unloaded file');
it('should resume playback if current file is stopped and already loaded');
it('should jump to new position if current file is loaded and begin playing');
