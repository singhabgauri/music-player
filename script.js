console.log("Let's write js")
let currentSong = new Audio();
let songs;
let currFolder

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);  // Get whole minutes
    let remainingSeconds = Math.floor(seconds % 60);     // Get the remaining seconds

    // Add leading zeros if needed (e.g., 0 -> 00, 5 -> 05)
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as)

    songs = []
    console.log(songs)
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href)               //songs.push(element.href.split("/songs/"))
        }

    }

    //Showing songs in the playlist
    let songUL = document.querySelector(".song-bar").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        // Extract only the filename from the full URL
        let songName = song.split("/").pop().replace(".mp3", "");  // Get the last part of the URL and remove .mp3
        let formattedSong = decodeURIComponent(songName)  // Decode any encoded characters

        // console.log(formattedSong);  // Check if the song name is correct

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
    // return songs
    // console.log(songs)

    Array.from(document.querySelector(".song-bar").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            const trackName = e.querySelector(".song-name").innerText.trim();
            const trackUrl = `${currFolder}/${encodeURIComponent(trackName)}.mp3`; // Construct the full URL here
            // console.log("Playing:", trackUrl);  //console.log("Playing:", trackName);


            // Use the correct song URL
            // playMusic(`/songs/${encodeURIComponent(trackName)}.mp3`);
            playMusic(trackUrl);
        });
    });

    return songs

}

// const playMusic=(track, pause=false)=>{
//     // let audio = new Audio("/songs/" + track)
//     currentSong.src = track   // "/songs/"+track
//     if(!pause){
//         currentSong.play()
//         play.src = "pause.svg"
//     }
//     else{
//         currentSong.pause();
//         play.src = "play.svg"
//     }

//     document.querySelector(".songinfo").innerHTML = decodeURI(track) 
//     document.querySelector(".song-time").innerHTML ="00:00 / 00:00"
// }

const playMusic = (track, pause = false) => {
    // Set the audio source using the full track URL
    currentSong.src = track;
    // console.log(currentSong.src)

    // Extract the song name from the URL for display
    let songName = track.split("/").pop().replace(".mp3", "");
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(songName);

    // Initialize the play/pause behavior
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
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors)
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            // console.log(e.href)
            let folder = e.href.split("/").slice(-1)[0]
            // console.log(folder)
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <button class="play-btn"><img src="play.svg" alt=""></button>
                    </div>
                    <div class="card-img">
                        <img src="/songs/${folder}/cover.jpg" alt="pritam-logo">
                    </div>
                    <div class="a1">
                        <p class="a-name">${response.title}</p>
                    </div>
                    <div class="a2">
                        <p class="a-prof">${response.description}</p>
                    </div>

                </div> `

            console.log(cardContainer)
        }
    }

    //Load the playlist whenever card is clicked
    // Array.from(document.getElementsByClassName("card")).forEach(e => {
    //     console.log(e)
    //     e.addEventListener("click", async item => {
    //         console.log(item, item.currentTarget.dataset)
    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)

    //     })

    // })

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async event => {
            const folder = event.currentTarget.dataset.folder;
            songs = await getSongs(`songs/${folder}`);

            // **Show the song list only when a card is clicked**
            document.querySelector(".song-bar").style.display = "block";  // <-- New line added
        });
    });

}

async function main() {

    document.querySelector(".song-bar").style.display = "none";


    //Gettings songs
    // let songs = await getSongs("songs/cs")
    await getSongs("songs/cs")
    playMusic(songs[0], true)
    console.log(songs)

    //Display all the albums on the page
    displayAlbums()


    // console.log(songUL)
    // for (const song of songs) {
    //     let formattedSong = song
    //         .replaceAll("%20", " ")
    //         .replaceAll("http://127.0.0.1:5500/songs/", " ")  // Example: Replace %2C with a comma
    //         .replaceAll("%2C", " ") // Example: Replace %27 with an apostrophe
    //         .replaceAll("%26", " ");

    //         console.log(formattedSong)

    //     songUL.innerHTML += `<li>
    //                     <img class="invert" src="music.svg" alt="">
    //                     <div class="song-info">
    //                         <div class="song-name">
    //                             ${formattedSong}
    //                         </div>

    //                         <div class="song-artist">
    //                             song-artist
    //                         </div>
    //                     </div>
    //                     <div class="play-now">
    //                         <span>Play Now</span>
    //                         <img class="invert" src="play.svg" alt="">

    //                     </div>


    //                 </li>`;



    // }





    // //Play the first song
    // var audio = new Audio(songs[0]);
    // audio.play();

    // audio.addEventListener("loadeddata", () => {
    //     // let duration = audio.duration;
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
    //     // The duration variable now holds the duration (in seconds) of the audio clip
    //   });

    //Attach an event listener  to each song
    // Array.from(document.querySelector(".song-bar").getElementsByTagName("li")).forEach(e => {
    //     e.addEventListener("click", element=>{
    //         console.log(e.querySelector(".song-info").firstElementChild.innerHTML)
    //         playMusic(e.querySelector(".song-info").firstElementChild.innerHTML.trim())

    //     })

    // });

    //Attach an evvent listener to play, previous and next 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"

        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    }
    )


    //Listen for time update event 
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        document.querySelector(".progress-fill").style.width = (currentSong.currentTime / currentSong.duration) * 100 + "%"; //green background

    })

    // Add an event listener to seekbar 
    document.querySelector(".seek-bar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    })

    previous.addEventListener("click", () => {
        console.log("Previous clicked");


        // Get the current song name from the src
        let currentSongName = currentSong.src.split("/").pop();
        console.log("Current song:", currentSongName);

        // Find the index of the current song
        console.log(songs);
        let index = songs.findIndex(song => song.includes(currentSongName));
        console.log("Current song index:", index);

        // Check if there is a previous song to play
        if (index - 1 >= 0) {
            let previousSong = songs[index - 1];  // Get the previous song
            playMusic(previousSong);  // Play the previous song
        } else {
            console.log("This is the first song, can't go back.");
            currentSong.currentTime = 0;  // Reset to the start of the current song
        }
    });

    next.addEventListener("click", () => {
        console.log("Next clicked");
        // console.log(currentSong);
        console.log(currentSong.src);
        console.log(songs);

        // Get the current song name from the src
        let currentSongName = currentSong.src.split("/").pop();
        console.log("Current song:", currentSongName);

        // songs = []

        // Find the index of the current song
        let index = songs.findIndex(song => song.includes(currentSongName));
        console.log("Current song index:", index);
        console.log(songs.length)

        // Check if there is a next song
        if (index + 1 < songs.length) {
            let nextSong = songs[index + 1];  // Get the next song
            console.log("Next song:", nextSong);

            playMusic(nextSong);  // Play the next song
        } else {
            // playMusic(songs[0]); 
            // console.log("No more songs in the playlist");
            console.log("End of playlist, pausing music.");
            currentSong.pause();  // Pause the music
            currentSong.currentTime = 0;  // Reset the playback time
            play.src = "play.svg";  // Change the button to 'play' icon
        }
    });

    // next.addEventListener("click", ()=>{
    //     console.log("Next clicked")
    //     console.log(currentSong)

    //     let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    //     // console.log(index)
    //     if((index+1)< songs.length){
    //         playMusic(songs[index+1]);
    //     }
    // })

    

    // Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
        // const volumeValue = parseInt(e.target.value) / 100; // Normalize to range [0, 1]
        // currentSong.volume = volumeValue; // Set the normalized volume
        // console.log("Volume set to:", volumeValue); // Log the volume
    }
    )


    // Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        // console.log(e.target)
        // console.log("changing", e.target.src)
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    
}

main()

