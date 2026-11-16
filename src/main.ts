import firebot, {Plugin, TriggeredEvent} from "@crowbartools/firebot-types";

import packageInfo from '../package.json';
import {PluginEventHandler} from "@crowbartools/firebot-types/types/plugin-api";
import {TemperatureConverter} from "./converters/temperature";
import {SpeedConverter} from "./converters/speed";
import {MassConverter} from "./converters/mass";
import {PressureConverter} from "./converters/pressure";
import {FluidVolumeConverter} from "./converters/fluid-volume";
import {DistanceConverter} from "./converters/distance";

type Params = {
    message: string;
}

const plugin: Plugin<Params> = {
    manifest: {
        icon: {
            type: "font-awesome",
            name: "fa-flask",
            color: "#0b0b2b"
        },
        name: packageInfo.name,
        description: packageInfo.description,
        author: packageInfo.author,
        version: packageInfo.version,
        repo: "https://github.com/L00Cyph3r/Firebot-auto-converter",
        minimumFirebotVersion: {major: 5, minor: 67},
    },
    onLoad: (context) => {
        firebot.events.onTriggered(eventHandler);
    }
}

const eventHandler: PluginEventHandler = (event: TriggeredEvent) => {
    if (event.event.id !== 'chat-message') {
        return;
    }
    // @ts-ignore
    // Don't process replies, we'll get inifinite loops if we do.
    if (event.meta.chatMessage.isReply) {
        return;
    }

    let message = <string>event.meta.messageText;
    firebot.logger.info(`Message received: "${message}"`);

    TemperatureConverter.chatMessageHandler(event);
    SpeedConverter.chatMessageHandler(event);
    MassConverter.chatMessageHandler(event);
    PressureConverter.chatMessageHandler(event);
    FluidVolumeConverter.chatMessageHandler(event);
    DistanceConverter.chatMessageHandler(event);
}
export default plugin;
