console.log("Let's write js")
let currentSong = new Audio();
let songs = [];
let currFolder = "";

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;

    // fetch info.json
    let response = await fetch(`/${folder}/info.json`);
    if (!response.ok) {
        console.error("Failed to load info.json for", folder);
        return [];
    }

    let albumInfo = await response.json();
    songs = albumInfo.tracks.map(track => `/${folder}/${track}`);

    // render playlist
    let songUL = document.querySelector(".song-bar ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = song.split("/").pop().replace(".mp3", "");
        let formattedSong = decodeURIComponent(songName);

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

    // add click listeners
    Array.from(document.querySelectorAll(".song-bar li")).forEach(e => {
        e.addEventListener("click", () => {
            const trackName = e.querySelector(".song-name").innerText.trim();
            const trackUrl = `/${currFolder}/${encodeURIComponent(trackName)}.mp3`;
            playMusic(trackUrl);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    if (!track) return;

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
};

async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");

    // manually list available albums (subfolders of songs/)
    let albums = ["cs"]; // add more here when you create new albums

    for (let folder of albums) {
        let response = await fetch(`/songs/${folder}/info.json`);
        if (!response.ok) continue;

        let info = await response.json();

        cardContainer.innerHTML += `
            <div data-folder="songs/${folder}" class="card">
                <div class="play">
                    <button class="play-btn"><img src="play.svg" alt=""></button>
                </div>
                <div class="card-img">
                    <img src="/songs/${folder}/cover.jpg" alt="cover">
                </div>
                <div class="a1">
                    <p class="a-name">${info.title}</p>
                </div>
                <div class="a2">
                    <p class="a-prof">${info.description}</p>
                </div>
            </div>`;
    }

    // load songs on click
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async event => {
            const folder = event.currentTarget.dataset.folder;
            songs = await getSongs(folder);
            if (songs.length > 0) {
                document.querySelector(".song-bar").style.display = "block";
                playMusic(songs[0], true);
            }
        });
    });
}

async function main() {
    document.querySelector(".song-bar").style.display = "none";

    // load default album
    songs = await getSongs("songs/cs");
    if (songs.length > 0) {
        playMusic(songs[0], true);
    }

    displayAlbums();

    // play/pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // progress bar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML =
            `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".progress-fill").style.width =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // seek
    document.querySelector(".seek-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // prev/next
    previous.addEventListener("click", () => {
        let currentSongName = currentSong.src.split("/").pop();
        let index = songs.findIndex(song => song.includes(currentSongName));
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let currentSongName = currentSong.src.split("/").pop();
        let index = songs.findIndex(song => song.includes(currentSongName));
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            currentSong.pause();
            currentSong.currentTime = 0;
            play.src = "play.svg";
        }
    });

    // volume slider
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // mute toggle
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
