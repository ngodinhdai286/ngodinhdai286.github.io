/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play /pause/stop
 * 4. CD Rotate
 * 5. Next / Prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'NDD';

const player = $('.player');
const playlist = $('.playlist');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#process');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-previous');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
  currenIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

  songs: [
    {
      name: 'Anh Chưa Thương Em Đến Vậy Đâu',
      singer: 'Lady Mây',
      path: './assets/music/ACTEDVD.mp3',
      image: './assets/img/ACTEDVD.png',
    },
    {
      name: 'We Dont Talk Anymore',
      singer: 'Charlie Puth ft Selena Gomez',
      path: './assets/music/WDTANM.mp3',
      image: './assets/img/WDTANM.png',
    },
    {
      name: 'Đáp Án Cuối Cùng',
      singer: 'Quân AP',
      path: './assets/music/DACC.mp3',
      image: './assets/img/DACC.png',
    },
    {
      name: 'Perfect',
      singer: 'Ed Sheeran',
      path: './assets/music/Perfect.mp3',
      image: './assets/img/Perfect.png',
    },
    {
      name: 'Có Chơi Có Chịu',
      singer: 'Only C ft Karik',
      path: './assets/music/CCCC.mp3',
      image: './assets/img/CCCC.png',
    },
    {
      name: 'Waiting For You',
      singer: 'Mono',
      path: './assets/music/WFU.mp3',
      image: './assets/img/WFU.png',
    },
    {
      name: 'Ngày Mai Em Đi Mất',
      singer: 'Khải Đăng',
      path: './assets/music/NMEDM.mp3',
      image: './assets/img/NMEDM.png',
    },
    {
      name: 'Night Changes',
      singer: 'One Direction',
      path: './assets/music/NC.mp3',
      image: './assets/img/NC.png',
    },
    {
      name: 'Story Of My Life',
      singer: 'One Direction',
      path: './assets/music/Story.mp3',
      image: './assets/img/Story.png',
    },
    {
      name: 'May Mà Không May',
      singer: 'Vương Anh Tú',
      path: './assets/music/MMKM.mp3',
      image: './assets/img/MMKM.png',
    },
    {
      name: 'Nước Mắt Lưng Tròng',
      singer: 'Vương Anh Tú',
      path: './assets/music/NMLT.mp3',
      image: './assets/img/NMLT.png',
    },
    {
      name: 'Thoát Vai Người Yêu',
      singer: 'Vương Anh Tú',
      path: './assets/music/TVNY.mp3',
      image: './assets/img/TVNY.png',
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currenIndex ? 'active' : ''
        }" data-index="${index}">
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-v"></i>
                </div>
            </div>
        `;
    });
    playlist.innerHTML = htmls.join('');
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currenIndex];
      },
    });
  },
  handleEvents: function () {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // Xử lý CD quay/dừng
    const cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    // Xử lý phóng to/thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    // Xử lý khi Click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    // Khi bài hát được play
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimate.play();
    };

    // Khi bài hát được pause
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimate.pause();
    };

    // Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
      }
    };

    // Xử lý khi tua bài hát
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Khi next bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      }
      _this.nextSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Khi prev bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      }
      _this.prevSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    // Xử lý bật/tắt random bài hát
    randomBtn.onclick = function (e) {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    };

    // Xử lý repeat bài hát
    repeatBtn.onclick = function (e) {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    };

    // Xử lý next bài hát khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    // Lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active');
      // Xử lý khi click vào song
      if (songNode || !e.target.closest('.option')) {
        // Xử lý khi click vào bài hát
        if (songNode) {
          _this.currenIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          audio.play();
          _this.render();
        }

        // Xử lý khi click vào option bài hát
        if (!e.target.closest('.option')) {
        }
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(() => {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  },

  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;

    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = this.currentSong.path;

    // console.log(heading, cdThumb, audio);
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },

  nextSong: function () {
    this.currenIndex++;
    if (this.currenIndex >= this.songs.length) {
      this.currenIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currenIndex--;
    if (this.currenIndex < 0) {
      this.currenIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (!newIndex === this.currenIndex);

    this.currenIndex = newIndex;
    this.loadCurrentSong;
  },

  start: function () {
    // Gán cấu hình từ Config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính cho Object
    this.defineProperties();

    // Lắng nghe và xử lý các sự kiện (DOM Events)
    this.handleEvents();

    // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Render danh sách bài hát
    this.render();

    // Hiển thị trạng thái ban đầu của button repeat và random
    randomBtn.classList.toggle('active', this.isRandom);
    repeatBtn.classList.toggle('active', this.isRepeat);
  },
};

app.start();
