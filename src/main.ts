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
            type: "custom",
            url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAwFBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8zMzPMzMwMDAwFBAQUFBQiIiL6+vrR0dHPz88sLCwbGxsWCABERETYVwDt7e0nJycwMDCJNwDf39+7u7vRUwDX19efn5/+/v7z8/Pl5eXHx8eqqqpra2x8fHxOTk9FGwArEQBzLQBfJgCUlJRbXF2Kioo5OTmrRQLsbRjBTwT/gCo8W39zAAAAE3RSTlMA99gFnuwLjCdbMrPBcz4Z0EzlrdN/+wAAA4RJREFUSMeNVul6okAQDJdGvNCBuVguQUBQBM94JPv+b7UDgyZRSLZ/8M1RRXUz3T28vDyZNOpqCsaK1h1JL/9hr7KCiEOpQ5Aiv/6OH2mIzo3K5hRpo1/fLyLbuJuNxF80On1AjS9GQb/zI6EnADp3EKHzOSXImVMg9H4UGACAENl6iBDkbQlCAAx+kpgIAIAgNs2ckNw044BNhckPBJkBcKozy/PymWK2ILfjxyLbtzPdhPHKj62lntlsQRy3h1y+0DP12LsUhXdZ66ZXSraGLZUelYQzRgFFzLeK0O7T67TcppGeeM5542wjPaLlyrTt8IagsrOeFYFtz88r/cxXhi0ha3ybnD33eDjs3NMb4StaY9hSLcDMvb7PZovQvS80SowUgur9/fvf98Vssa+nBCsNSTseINu5KXz8ZRLXWgHbFAyenJK6mBoBrhnH9/fZ4lhPkGEQ0JWe0tRh6c8JjuGGs1noUu4iKeviMWlZ3cxrAini9dY9hO42Tj3MCQbF3yupI+PA4IRLnplZfCJkG2dmsiGcYDhA7jw6VNYX8NYrXTeTdZ6vE1Nf+qkDSm1j/s0p7lAZm7c2y7T2LQgtvxqlhBdt8NWpbuWQEQCar/TK/CTx+SjbYP42B3RveHVKeIvAm0yvzTRvA8sDlb82nqp3AbvCg8v6Bvtifoo44y4xFgnHg020fCaY0APYqT56XXsTIWBNjn1RJ86e8foy2pTHzaIkdT/oIpufqQf9BoIe5WWWYxJQ7pPUx3WWFlYzIbZ5EiLQl+rmVZdaMyFZezdE1dTuBPxmRQ14M4HbbwSp/0lIGj7ryvokVC5V7a4inK2GqJcR/CTIX5sFwBsLPkswgfXlhuC1rSr1/MRS7vHoWAQwpjVAUevqFJSB3BdYZkAIs+Uj3mK5IfTlgSLc6rQzUjsvnYmIWBBMY/Xpv8/w0CqANmEAdfRwU6iak5aMP9nKZDJL04/KqfVGNLW59akizUsItJIoipI/sBqnVFRbLyAlSGFFuZkF3+i07Qrq9Fjg5JTG0KoNxumJAKXbrNCR3V0Y7tjV4J2KYrMpipMXILwLD/tp45XyqhxmrAVfD7u967LqcF13vztcF7PZx15uvtP34QfbZqSPcI/B7lrPrke31/ZX4u6OhzAMj+6gNxT3RzY8HHeuOGz5q5FGw76oCEAQu+OSP8VAULT+8FuT/AdDFpKgSf4ulgAAAABJRU5ErkJggg==",
        },
        name: "Automatic Unit Converter",
        description: packageInfo.description,
        author: packageInfo.author,
        version: packageInfo.version,
        repo: "https://github.com/L00Cyph3r/Firebot-auto-converter",
        minimumFirebotVersion: {major: 5, minor: 67},
    },
    onLoad: () => {
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
