# Project Structure

## File Tree

```
├─ apps
│  ├─ server
│  │  └─ src
│  │     ├─ game
│  │     │  └─ GameLoop.ts
│  │     ├─ http
│  │     │  └─ createRoom.ts
│  │     ├─ mappers
│  │     │  └─ toRoomDto.ts
│  │     ├─ rooms
│  │     │  ├─ PlayerSession.ts
│  │     │  ├─ Room.ts
│  │     │  └─ RoomManager.ts
│  │     ├─ ws
│  │     │  ├─ handlers
│  │     │  │  └─ index.ts
│  │     │  └─ server.ts
│  │     └─ index.ts
│  └─ web
│     ├─ src
│     │  ├─ api
│     │  │  └─ rooms.ts
│     │  ├─ audio
│     │  │  ├─ audio.ts
│     │  │  ├─ index.ts
│     │  │  └─ sounds.ts
│     │  ├─ components
│     │  │  ├─ common
│     │  │  │  └─ animatedFavicon.ts
│     │  │  └─ screens
│     │  │     └─ game
│     │  │        └─ slotSymbols.ts
│     │  ├─ network
│     │  │  ├─ client.ts
│     │  │  └─ socket.ts
│     │  ├─ state
│     │  │  └─ store.ts
│     │  ├─ types
│     │  │  └─ playerView.ts
│     │  └─ utils
│     │     ├─ playerInfo.ts
│     │     └─ roomHash.ts
│     └─ vite.config.ts
└─ packages
   ├─ core
   │  └─ src
   │     ├─ api
   │     │  ├─ applyCommand.ts
   │     │  ├─ createGame.ts
   │     │  ├─ getPublicState.ts
   │     │  └─ tickGame.ts
   │     ├─ config
   │     │  ├─ MathPresets
   │     │  │  ├─ classic-high.ts
   │     │  │  ├─ classic-low.ts
   │     │  │  ├─ classic-medium.ts
   │     │  │  ├─ high-rtp-test.ts
   │     │  │  └─ index.ts
   │     │  ├─ GameConfig.ts
   │     │  ├─ MathConfig.ts
   │     │  └─ MathRegistry.ts
   │     ├─ engine
   │     │  ├─ Payout.ts
   │     │  ├─ RNG.ts
   │     │  └─ SlotEngine.ts
   │     ├─ game
   │     │  ├─ GameState.ts
   │     │  ├─ Player.ts
   │     │  ├─ Round.ts
   │     │  └─ Rules.ts
   │     └─ index.ts
   ├─ protocol
   │  └─ src
   │     ├─ events
   │     │  ├─ client.ts
   │     │  └─ server.ts
   │     ├─ types
   │     │  ├─ GameStateDTO.ts
   │     │  ├─ PlayerDTO.ts
   │     │  └─ RoomDTO.ts
   │     └─ index.ts
   └─ shared
      └─ src
         ├─ constants
         │  └─ rooms.ts
         ├─ utils
         │  └─ randomId.ts
         └─ index.ts
```

## File Index

### apps/server/src/game/GameLoop.ts

Classes:
- GameLoop

### apps/server/src/http/createRoom.ts

Exported Functions:
- registerCreateRoomRoute(app, roomManager)

Internal Functions:
- createRoomId()

Types:
- CreateRoomBody

### apps/server/src/index.ts

Internal Functions:
- bootstrap()

### apps/server/src/mappers/toRoomDto.ts

Exported Functions:
- toGameStateDto(args)
- toRoomDto(args)

### apps/server/src/rooms/PlayerSession.ts

Classes:
- PlayerSession

Types:
- PlayerSessionSnapshot

### apps/server/src/rooms/Room.ts

Classes:
- Room

Types:
- RoomSnapshot
- RoomSubscriber

### apps/server/src/rooms/RoomManager.ts

Classes:
- RoomManager

Types:
- CreateRoomOptions

### apps/server/src/ws/handlers/index.ts

Exported Functions:
- registerSocketHandlers(socket, roomManager)

Internal Functions:
- cleanupConnection(context)
- handleBet(context, event)
- handleConfirmBet(context, event)
- handleJoin(context, event)
- handleLeave(context)
- handleReady(context, event)
- handleStart(context, event)
- isClientEvent(value)
- send(socket, event)
- subscribeToRoom(context, room)

Types:
- ConnectionContext

### apps/server/src/ws/server.ts

Exported Functions:
- attachWebSocketServer(app, roomManager)

### apps/web/src/api/rooms.ts

Exported Functions:
- createRoom(request)
- getMathProfiles()

Types:
- CreateRoomRequest
- CreateRoomResponse
- GetMathProfilesResponse

### apps/web/src/audio/audio.ts

Exported Functions:
- initAudio()
- isMusicEnabled()
- isSfxEnabled()
- playLoop(id)
- playMusic(source)
- playSound(id)
- setMasterVolume(value)
- setMusicEnabled(value)
- setMusicVolume(value)
- setMuted(value)
- setSfxEnabled(value)
- stopLoop(id)
- stopMusic()
- unlockAudio()

Internal Functions:
- applyBaseVolume(audio, id)
- applyMusicVolume(audio, id)
- clamp(value)
- clearActiveMusicHandlers(audio)
- isSoundKey(value)
- playPlaylistTrack(token)
- shuffleStrings(values)

Types:
- SoundKey

### apps/web/src/audio/index.ts

### apps/web/src/audio/sounds.ts

Types:
- SoundDefinition
- SoundId

### apps/web/src/components/common/animatedFavicon.ts

Exported Functions:
- startAnimatedPawFavicon()

Internal Functions:
- createGoldenPawSvg(size, angle)
- getOrCreateFaviconLink()

### apps/web/src/components/screens/game/slotSymbols.ts

Types:
- SlotSymbolId

### apps/web/src/network/client.ts

Exported Functions:
- createRealtimeClient(options)

Internal Functions:
- createId(prefix)
- getOrCreatePlayerId()
- getOrCreateSessionId()
- savePlayerId(value)

Types:
- RealtimeClient
- RealtimeClientOptions

### apps/web/src/network/socket.ts

Exported Functions:
- createSocket(url)

Types:
- SocketClient
- SocketStatus

### apps/web/src/state/store.ts

Exported Functions:
- createClientStore(options)

Types:
- ClientStore
- ClientStoreState
- CreateClientStoreOptions
- CreateRoomOptions
- FooterState

### apps/web/src/types/playerView.ts

Types:
- PlayerView

### apps/web/src/utils/playerInfo.ts

Exported Functions:
- getStoredPlayerInfo()
- savePlayerInfo(name, avatar)

### apps/web/src/utils/roomHash.ts

Exported Functions:
- clearRoomIdHash()
- getRoomIdFromHash()
- setRoomIdHash(roomId)

Internal Functions:
- buildUrlWithoutHash()

### apps/web/vite.config.ts

### packages/core/src/api/applyCommand.ts

Exported Functions:
- applyCommand(state, command)

Internal Functions:
- canStartGame(state)
- createBettingRound(state, now)
- createPresentingRound(state, now)
- replacePlayer(players, playerId, update)
- sanitizeBet(state, amount, balance)

Types:
- GameCommand

### packages/core/src/api/createGame.ts

Exported Functions:
- createGame(args)

### packages/core/src/api/getPublicState.ts

Exported Functions:
- getPublicState(state)

Types:
- PublicGameConfig
- PublicGameState
- PublicPlayerState
- PublicRoundState
- PublicSpinResult
- PublicWinningLine

### packages/core/src/api/tickGame.ts

Exported Functions:
- tickGame(state, now)

Internal Functions:
- buildSpinResult(state)
- createBettingPhaseForCurrentRound(state, now)
- createBettingRound(state, now, index)
- createNextBettingRound(state, now)
- getAlivePlayers(players)
- getPaylineSequenceDuration(linesCount, config)
- getPresentingDurationMs(state)
- getResolvedDurationMs(state)
- getWinnerPlayerId(state, players)
- haveAllActivePlayersConfirmedBets(state)
- normalizeBetsForSpin(state)
- preparePlayersForNextRound(state)
- resolveAutoBet(state, player)
- resolvePreferredBet(state, player)
- resolveRoundOutcome(state, result)
- sanitizeRoundBet(minBet, maxBet, player)
- shouldFinishGame(state, players)

### packages/core/src/config/GameConfig.ts

Exported Functions:
- buildGameConfig(overrides)

Types:
- GameConfigOverrides

### packages/core/src/config/MathConfig.ts

Types:
- MathProfileId
- MathProfileOption
- MathStats
- SlotMathConfig

### packages/core/src/config/MathPresets/classic-high.ts

### packages/core/src/config/MathPresets/classic-low.ts

### packages/core/src/config/MathPresets/classic-medium.ts

### packages/core/src/config/MathPresets/high-rtp-test.ts

### packages/core/src/config/MathPresets/index.ts

### packages/core/src/config/MathRegistry.ts

Exported Functions:
- getAllMathConfigs()
- getMathConfig(profileId)
- getMathProfileOptions()

### packages/core/src/engine/Payout.ts

Classes:
- PayoutCalculator

Types:
- PayoutResult

### packages/core/src/engine/RNG.ts

Classes:
- RNG

### packages/core/src/engine/SlotEngine.ts

Classes:
- SlotEngine

### packages/core/src/game/GameState.ts

Exported Functions:
- getActivePlayers(state)
- getPlayerById(state, playerId)

Types:
- GameId
- GameState

### packages/core/src/game/Player.ts

Exported Functions:
- createPlayer(args)

Types:
- PlayerId
- PlayerState

### packages/core/src/game/Round.ts

Exported Functions:
- createRound(seed)

Types:
- RoundState
- SpinGrid
- SpinResult
- WinningLine

### packages/core/src/game/Rules.ts

Types:
- GameConfig
- GameSettings
- GameStatus
- MissedBetPolicy
- Payline
- PaylinePresentationConfig
- PayoutBasePolicy
- Paytable
- RoundRules
- RoundStatus
- SymbolId
- TiePayoutPolicy
- WinnerSelectionPolicy

### packages/core/src/index.ts

### packages/protocol/src/events/client.ts

Types:
- ClientEvent
- ConfirmBetEvent
- JoinRoomEvent
- LeaveRoomEvent
- SetBetEvent
- SetReadyEvent
- StartGameEvent

### packages/protocol/src/events/server.ts

Types:
- ErrorEvent
- JoinedRoomEvent
- LeftRoomEvent
- RoomStateEvent
- ServerEvent

### packages/protocol/src/index.ts

### packages/protocol/src/types/GameStateDTO.ts

Types:
- GameConfigDTO
- GameStateDTO
- GameStatusDTO
- MathProfileIdDTO
- PaylineDTO
- PaylinePresentationConfigDTO
- RoundDTO
- RoundStatusDTO
- SpinResultDTO
- SymbolIdDTO
- WinningLineDTO

### packages/protocol/src/types/PlayerDTO.ts

Types:
- PlayerDTO

### packages/protocol/src/types/RoomDTO.ts

Types:
- RoomDTO

### packages/shared/src/constants/rooms.ts

### packages/shared/src/index.ts

### packages/shared/src/utils/randomId.ts

Exported Functions:
- randomId()
