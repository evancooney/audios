import { Container } from 'unstated';
import { Howl, Howler } from 'howler';

type AudiosState = {
  url: string,
  filename: string,
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
};

class AudiosContainer extends Container<AudiosState> {
  state = {
    url: '',
    filename: '',
    audiofileId: '',
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

   loadSound = (url) => (
     new Promise((resolve, reject) => {
       this.setState({ isLoading: true, url });
       const sound = new Howl({
         src: [url],
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

  play = (url, position = 0, filename, audiofileId) => {
    // private playback function
    this._play = (callback, position) => {
      this.seek(position);
      this.state.sound.pause();
      this.state.sound.play();

      this.setState({
        isPlaying: true,
        current: position,
        filename,
        audiofileId,
      });
      callback();
    };

    return new Promise((resolve, reject) => {
      if (this.state.sound === undefined || this.state.url !== url) {
        this.unloadSound().then(() => {
          this.loadSound(url).then(() => {
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
