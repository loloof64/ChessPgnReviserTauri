# Chess Pgn Reviser

Load your chess Pgn file and try to find moves from your side.

Please notice that on Windows, you may have to wait a little the first time to have content in place of the blank window. Also, please check that your input PGN file is in UTF-8 format, otherwise the game won't be loaded and will throw an error. Apologizing for setting this constraint.

## Executables

You can download executables in the release section of this repository :
* Windows : *.msi
* Mac OS : *.dmg
* Linux : *.deb (Debian package), or *.appimage (no any dependency)

## Games goal

You can, in each game of your pgn, add a tag **Goal**, whith one of the following values:
* "1-0" : for a white win,
* "0-1" : for a black win,
* "1/2-1/2" : for a draw.

If you don't put this tag, the goal will be considered as unknown, which can be fine for many games.

## Credits

Application icon downloaded from https://www.flaticon.com/free-icon/chess_178148 and designed by Flat Icons.

Other images have been downloaded from flaticon :
* start.png : from https://www.flaticon.com/free-icon/finish_2164730, designed by SmashIcons
* reverse.png : from https://www.flaticon.com/free-icon/arrows_685838, designed by Good Ware
* stop : downloaded at https://www.flaticon.com/free-icon/stop_827428 and designed by SmashIcons
* first_item : downloaded at https://www.flaticon.com/free-icon/arrowheads-of-thin-outline-to-the-left_32766 and designed by FreePik
* previous_item : downloaded at https://www.flaticon.com/free-icon/black-triangular-arrowhead-pointing-to-left-direction_45050 and designed by FreePik
* last_item : downloaded at https://www.flaticon.com/free-icon/right-thin-arrowheads_32738 and designed by FreePik
* next_item : downloaded at https://www.flaticon.com/free-icon/right-triangular-arrowhead_44452 and designed by FreePik
* cross_arrows : downloaded at https://www.flaticon.com/free-icon/shuffle-crossing-arrows_59489 and designed by FreePik
* question_mark : downloaded at https://www.flaticon.com/free-icon/question-mark-on-a-circular-black-background_25400 and designed by Dave Gandy
* dices : downloaded at https://www.flaticon.com/free-icon/dice_1009624 and designed by Vitaly Gorbachev
* disk : downloaded at https://www.flaticon.com/free-icon/disk_718913 and designed by DinosoftLabs

FreeSerif font downloaded from https://fr.fonts2u.com/free-serif.police

## Developpers

1. Install Tauri : https://tauri.studio/en/docs/getting-started/intro
2. launch command `yarn` from your terminal in order to install dependencies.
3. launch `yarn tauri:serve` for a local development server.

### Publishing a release

* edit **package.json**, and update fields **version** and **release_message**
* edit **tauri.conf.json** and update field **version**
* edit **Cargo.toml** and update field **version**

So that a Github Action will be able to publish a new release