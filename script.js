console.log("Let's write js")
let currentSong = new Audio();
let songs;
let currFolder

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);  // Get whole minutes
    let remainingSeconds = Math.floor(seconds % 60);     // Get the remaining seconds

    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)
        }
    }

    let songUL = document.querySelector(".song-bar").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        let songName = song.split("/").pop().replace(".mp3", "");
        let formattedSong = decodeURIComponent(songName)

        songUL.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="">
                <div class="song-info">
                    <div class="song-name">${formattedSong}</div>
                </div>
                <div class="play-now">
                    <img class="invert" src="play.svg" alt="">
                </div>
            </li>`;
    }

    Array.from(document.querySelector(".song-bar").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const trackName = e.querySelector(".song-name").innerText.trim();
            const trackUrl = `${currFolder}/${encodeURIComponent(trackName)}.mp3`;
            playMusic(trackUrl);
        });
    });

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = track;

    let songName = track.split("/").pop().replace(".mp3", "");
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(songName);

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    } else {
        currentSong.pause();
        play.src = "play.svg";
    }

    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]

            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <button class="play-btn"><img src="play.svg" alt=""></button>
                    </div>
                    <div class="card-img">
                        <img src="/songs/${folder}/cover.jpg" alt="cover">
                    </div>
                    <div class="a1">
                        <p class="a-name">${response.title}</p>
                    </div>
                    <div class="a2">
                        <p class="a-prof">${response.description}</p>
                    </div>
                </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async event => {
            const folder = event.currentTarget.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            document.querySelector(".song-bar").style.display = "block";
        });
    });
}

async function main() {
    document.querySelector(".song-bar").style.display = "none";

    await getSongs("songs/cs")
    playMusic(songs[0], true)

    displayAlbums()

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        } else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".progress-fill").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seek-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    previous.addEventListener("click", () => {
        let currentSongName = currentSong.src.split("/").pop();
        let index = songs.findIndex(song => song.includes(currentSongName));
        if (index - 1 >= 0) {
            let previousSong = songs[index - 1];
            playMusic(previousSong);
        } else {
            currentSong.currentTime = 0;
        }
    });

    next.addEventListener("click", () => {
        let currentSongName = currentSong.src.split("/").pop();
        let index = songs.findIndex(song => song.includes(currentSongName));
        if (index + 1 < songs.length) {
            let nextSong = songs[index + 1];
            playMusic(nextSong);
        } else {
            currentSong.pause();
            currentSong.currentTime = 0;
            play.src = "play.svg";
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main()
