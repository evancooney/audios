import { Container } from 'unstated';
import { Howl, Howler } from 'howler';

type AudiosState = {
  url: string,
  filename: string,
  audiofile: Object,
  audiofileId: string,
  currentTime: number,
  currentTimeAsPercentage: number,
  duration: number,
  volume: number,
  sound: Object,
  isLoading: false,
  isPlaying: false,
  isError: false,
  errorMessage: string,
  html5: boolean,
  format: string,
  soundFarmToken: string,
};

class AudiosContainer extends Container<AudiosState> {
  state = {
    url: '',
    filename: '',
    audiofileId: '',
    audiofile: undefined,
    currentTime: 0,
    currentTimeAsPercentage: 0,
    duration: 0,
    volume: 0.8,
    isPlaying: false,
    isLoading: false,
    isError: false,
    errorMessage: '',
    sound: undefined,
    progressFunc: undefined,
    html5: true,
    format: 'ogg',
    soundFarmToken: ''
  }

  constructor(html5 = true) {
    super();
    this.setState({html5});
    if (Howler.codecs('ogg')) {
      this.setState({format: 'ogg'});
    } else {
      this.setState({format: 'mp3'});
    }
  }

  buildURL = (format, audiofile, token) => {
    if (typeof audiofile === 'string' || !token) {
      return audiofile;
    }
    const baseURL = process.env.REACT_APP_API_BASE;
    const urls = {
      'flac': `${baseURL}/transcodes/flac/${audiofile._id}`,
      'ogg': `${baseURL}/transcodes/ogg/${audiofile._id}`,
      'mp3': `${baseURL}/transcodes/mp3/320k/${audiofile._id}`,
    };
    return urls[format];
  }

   loadSound = (audiofile, token) => (
     new Promise((resolve, reject) => {
       const url = this.buildURL(this.state.format, audiofile, token);
       const source = token && token !== 'fakeToken' ? `${url}?token=${token}` : url;

       this.setState({ isLoading: true, url });
       const sound = new Howl({
         src: [source],
         format: this.state.format,
         autoplay: false,
         html5: this.state.html5,
         onloaderror: (soundId, error) => {
           console.log('load error', soundId, error);
           this.setState({ isLoading: false }, () => {
             reject(sound);
           });
         },
         onload: () => {
           this.setState({
             sound,
             url,
             duration: sound.duration(),
             audiofile,
             isLoading: false,
           }, () => {
             resolve(sound);
           });
         },
         onplay: () => {
           this.startTrackingPosition();
         },
         onseek: () => {
           console.log(this.state.sound.seek());
         },
         onpause: () => {
           this.stopTrackingPosition();
         },
         onstop: () => {
         },
         onend: () => {
           this.stopTrackingPosition();
           this.setState({ isPlaying: false });
         },
         onplayerror: (soundId, error) => {
           console.log('onplayerror error', soundId, error);
           reject(error);
         },
       });
     })
   );

  unloadSound = () => (

    new Promise((resolve, reject) => {
      if (this.state.sound === undefined) {
        resolve();
        return;
      }
      if (this.state.progressFunc !== undefined) {
        this.stopTrackingPosition();
      }
      this.state.sound.unload();
      resolve();
    })
  )

  startTrackingPosition = () => {
    this.setState({
      progressFunc: setInterval(() => {
        const currentTime = this.state.sound.seek();
        this.setCurrentTime(currentTime);
      }, 500),
    });
  }

  stopTrackingPosition = () => {
    clearInterval(this.state.progressFunc);
    this.setState({progressFunc: null});
  }

  pause = () => {
    this.state.sound.pause();
    this.setState({ isPlaying: false });
  }

  play = (audiofile, soundFarmToken, position = 0) => {
    // private playback function
    this._play = (callback, position) => {
      this.seek(position);
      this.state.sound.pause();
      this.state.sound.play();

      this.setState({
        isPlaying: true,
        current: position,
        filename: typeof audiofile === 'object' ? audiofile.originalFile.filename : audiofile,
        audiofileId: typeof audiofile === 'object' ? audiofile.id : audiofile,
      });
      callback();
    };

    return new Promise((resolve, reject) => {
      if (this.state.sound === undefined || this.state.audiofileId !== audiofile.id) {
        this.unloadSound().then(() => {
          this.loadSound(audiofile, soundFarmToken).then(() => {
            this._play(resolve, position);
          }).catch((id, error) => {
            console.log(id, error);
            reject('could not load sound');
          });
        });
      } else {
        this._play(resolve, position);
      }
    });
  }

  setCurrentTime = (currentTime) => {
    const currentTimeAsPercentage = (currentTime / this.state.duration) * 100;
    this.setState({ currentTime, currentTimeAsPercentage });
  }

  seek = (seekLocation) => {
    this.state.sound.seek(seekLocation);
    this.setCurrentTime(seekLocation);
  }

  setVolume = (volume) => {
    const v = volume / 100;
    this.setState({ volume: v });
    this.state.sound.volume(v);
  }
}

export default AudiosContainer;
