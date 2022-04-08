import { useEffect, useState } from "react";

import { Pause, PlayArrow, SkipNext, SkipPrevious } from "@mui/icons-material";
import { Button } from "@mui/material";
import "./App.css";

function SongThumbnail({ url }) {
  return <img src={url} alt="song_thumbnail" width="200px" height="200px" />;
}

function SongTitle({ title }) {
  return (
    <p>
      <b>Title:</b> {title}
    </p>
  );
}

function Artist({ name }) {
  return (
    <p>
      <b>Artist:</b> {name}
    </p>
  );
}

function PreviousTrackButton({ onClick }) {
  return (
    <Button variant="contained" onClick={onClick} disableRipple color="info">
      <SkipPrevious />
    </Button>
  );
}

function PlayPauseButton({ onClick, play }) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disableRipple
      color={play ? "warning" : "secondary"}
    >
      {play ? <Pause /> : <PlayArrow />}
    </Button>
  );
}

function NextTrackButton({ onClick }) {
  return (
    <Button variant="contained" onClick={onClick} disableRipple color="info">
      <SkipNext />
    </Button>
  );
}

function getPreviousSongURL(songURL, songURLs) {
  const currIdx = songURLs.findIndex((url) => url === songURL);
  return songURLs.at(currIdx === 0 ? -1 : currIdx - 1);
}

function getNextSongURL(songURL, songURLs) {
  const currIdx = songURLs.findIndex((url) => url === songURL);
  return songURLs.at(currIdx === songURLs.length - 1 ? 0 : currIdx + 1);
}

function App() {
  const songURLs = [
    "https://soundcloud.com/poolhouseltd/vhs-dreams-meet-her-at-the-plaza",
    "https://soundcloud.com/eumigandchinon/pelle-g-childish-delight-eumig",
    "https://soundcloud.com/user-790028988/01-distant-dream-sleeping",
  ];
  const [songURL, setSongURL] = useState(songURLs[0]); // song urls
  const [songTitle, setSongTitle] = useState(null);
  const [songArtist, setSongArtist] = useState(null);
  const [songThumbnailURL, setSongThumbnailURL] = useState(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    async function getSCinfo(songURL) {
      const scUrl = `https://soundcloud.com/oembed.json?maxheight=200&url=${songURL}`; // TODO remove maxheight=200&
      const res = await fetch(scUrl);
      const data = await res.json();

      const thumbnail_url = data.thumbnail_url.replace(
        /^http:\/\//i,
        "https://"
      );
      const [songTitle, songArtist] = data.title
        .split("by")
        .map((a) => a.trim());

      setSongThumbnailURL(thumbnail_url);
      setSongTitle(songTitle);
      setSongArtist(songArtist);
    }
    getSCinfo(songURL, "thumbnail", true, true);

    // Ensure that play/pause button state always matches soundcloud widget play/pause state
    const SC = window.SC.Widget("so");
    SC.bind(window.SC.Widget.Events.PLAY, function () {
      setPlay(true);
    });
    SC.bind(window.SC.Widget.Events.PAUSE, function () {
      setPlay(false);
    });
  }, [songURL]);

  return (
    <div className="App">
      <SongThumbnail url={songThumbnailURL} />
      <SongTitle title={songTitle} />
      <Artist name={songArtist} />
      <PreviousTrackButton
        onClick={() =>
          setSongURL((songURL) => getPreviousSongURL(songURL, songURLs))
        }
      />

      <PlayPauseButton
        play={play}
        onClick={() => {
          const SC = window.SC.Widget("so");
          if (play) {
            SC.pause();
          } else {
            SC.play();
          }
          setPlay((status) => !status);
        }}
      />
      <NextTrackButton
        onClick={() => {
          setSongURL((songURL) => getNextSongURL(songURL, songURLs));
        }}
      />

      <div id="player" hidden>
        <iframe
          title="so"
          id="so"
          width="100%"
          height="100%"
          scrolling="no"
          frameBorder="0"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${songURL}&auto_play=true`}
        >
          Loading
        </iframe>
      </div>
    </div>
  );
}

export default App;
