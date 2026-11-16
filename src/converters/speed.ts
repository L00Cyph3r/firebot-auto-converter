import firebot, {TriggeredEvent} from "@crowbartools/firebot-types";

import {PluginEventHandler} from "@crowbartools/firebot-types/types/plugin-api";

type SpeedConversions = {
    amount: number,
    unit: SpeedUnit,
}

enum SpeedUnit {
    MetersPerSecond = 'm/s',
    KilometersPerHour = 'kph',
    MilesPerHour = 'mph',
    Knots = 'kts',
}

export class SpeedConverter {
    public static chatMessageHandler: PluginEventHandler = (event: TriggeredEvent): string | undefined => {
        let validUnits = [
            'kmh',
            'kph',
            'mph',
            'ms',
            'kts',
            'knots',
        ];
        // @ts-ignore
        let message = <string>event.meta.messageText;
        let messageId = <string>event.meta.messageId;

        const speedRegex = new RegExp(/(?:^|\s)(-?\d+[.,]?\d*)\s?(([km][mp]h|(km|mi)\/h|m\/s|k(no)?ts)\w*)/gi);
        let matches = speedRegex.exec(message.replaceAll(',', '.'));
        if (!matches) {
            firebot.logger.info('No matches found for speed');
            return;
        } else {
            let amount = parseFloat(matches[1]); // 22.27
            let unit = matches[2].toLowerCase().replaceAll('/', ''); // kmh
            if (!validUnits.includes(matches[2])) {
                return;
            }
            switch (unit) {
                case 'kmh':
                    unit = 'kph';
                    break;
                case 'ms':
                    unit = 'm/s';
                    break;
                case 'knots':
                    unit = 'kts';
                    break;
                default:
                    break;
            }
            let ue = <SpeedUnit>unit;
            let conversions: SpeedConversions[] = [];

            switch (ue) {
                case SpeedUnit.KilometersPerHour:
                    conversions.push({
                        amount: amount / 1.6009,
                        unit: SpeedUnit.MilesPerHour,
                    });
                    conversions.push({
                        amount: amount / 3.6,
                        unit: SpeedUnit.MetersPerSecond
                    });
                    conversions.push({
                        amount: amount / 1.852,
                        unit: SpeedUnit.Knots
                    });
                    break;
                case SpeedUnit.MetersPerSecond:
                    conversions.push({
                        amount: amount * 3.6,
                        unit: SpeedUnit.KilometersPerHour
                    });
                    conversions.push({
                        amount: amount * 2.237,
                        unit: SpeedUnit.MilesPerHour
                    });
                    conversions.push({
                        amount: amount * 1.944,
                        unit: SpeedUnit.Knots
                    });
                    break;
                case SpeedUnit.MilesPerHour:
                    conversions.push({
                        amount: amount * 1.6009,
                        unit: SpeedUnit.KilometersPerHour
                    });
                    conversions.push({
                        amount: amount / 1.151,
                        unit: SpeedUnit.Knots
                    });
                    conversions.push({
                        amount: amount / 2.237,
                        unit: SpeedUnit.MetersPerSecond
                    });
                    break;
                case SpeedUnit.Knots:
                    conversions.push({
                        amount: amount * 1.852,
                        unit: SpeedUnit.KilometersPerHour
                    });
                    conversions.push({
                        amount: amount * 1.151,
                        unit: SpeedUnit.MilesPerHour
                    });
                    conversions.push({
                        amount: amount * 1.944,
                        unit: SpeedUnit.MetersPerSecond
                    });
                    break;

                default:
                    firebot.logger.info('We are defaulting, no matches found for speed');
                    return;

            }

            firebot.logger.info(`Conversions for speed: ${JSON.stringify(conversions)}`);

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