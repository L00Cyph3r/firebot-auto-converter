import firebot, {TriggeredEvent} from "@crowbartools/firebot-types";

import {PluginEventHandler} from "@crowbartools/firebot-types/types/plugin-api";

type PressureConversions = {
    amount: number,
    unit: PressureUnit,
}

enum PressureUnit {
    Bar = 'bar',
    PSI = 'psi'
}

export class PressureConverter {
    public static chatMessageHandler: PluginEventHandler = (event: TriggeredEvent): string | undefined => {
        let validUnits = [
            'bar',
            'bars',
            'psi',
        ];
        // @ts-ignore
        let message = <string>event.meta.messageText;
        let messageId = <string>event.meta.messageId;

        const speedRegex = new RegExp(/(?:^|\s)(-?\d+[.,]?\d*)\s?((bar|psi)\w*)/gi);
        let matches = speedRegex.exec(message.replaceAll(',', '.'));
        if (!matches) {
            firebot.logger.info('No matches found for pressure');
            return;
        } else {
            let amount = parseFloat(matches[1]); // 22.27
            let unit = matches[2].toLowerCase().replaceAll('/', ''); // kmh
            if (!validUnits.includes(matches[2])) {
                return;
            }
            switch (unit) {
                case 'bars':
                    unit = 'bar';
                    break;
                default:
                    break;
            }
            let ue = <PressureUnit>unit;
            let conversions: PressureConversions[] = [];

            switch (ue) {
                case PressureUnit.Bar:
                    conversions.push({
                        amount: amount * 14.504,
                        unit: PressureUnit.PSI,
                    });
                    break;
                case PressureUnit.PSI:
                    conversions.push({
                        amount: amount / 14.504,
                        unit: PressureUnit.Bar
                    });
                    break;
                default:
                    firebot.logger.info('We are defaulting, no matches found for pressure');
                    return;

            }

            firebot.logger.info(`Conversions for pressure: ${JSON.stringify(conversions)}`);

            // TODO: Beautify later
            let response = `${amount} ${unit} is equal to `;
            let conversionStrings: string[] = [];
            conversions.forEach((conversion) => {
                conversionStrings.push(`${Math.round(conversion.amount * 100) / 100} ${conversion.unit}`);
            })
            response += conversionStrings.join(' or ');

            firebot.twitch.api.chat.sendChatMessage(response, messageId, true).then((result) => {
                firebot.logger.info(`Responded with ${response}`);
            }).catch((err) => {
                firebot.logger.error(`Could not send chat message. ${JSON.stringify(err)}`);
            });
        }
    }

}