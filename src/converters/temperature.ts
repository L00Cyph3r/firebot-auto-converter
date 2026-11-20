import firebot, {TriggeredEvent} from "@crowbartools/firebot-types";

import {PluginEventHandler} from "@crowbartools/firebot-types/types/plugin-api";

type TemperatureConversions = {
    amount: number,
    unit: TemperatureUnit,
}

enum TemperatureUnit {
    Kelvin = 'K',
    Celsius = 'C',
    Fahrenheit = 'F',
}

export class TemperatureConverter {
    public static chatMessageHandler: PluginEventHandler = (event: TriggeredEvent): void => {
        let message = <string>event.meta.messageText;
        let messageId = <string>event.meta.messageId;

        const temperatureRegex = new RegExp(/(?:^|\s)(-?\d+[.,]?\d*)\s?(?:[\s°]|deg|degree|degrees)?\s?(([ckf])(?:\w+)?)/gi);
        let matches = temperatureRegex.exec(message.replaceAll(',', '.'));
        if (!matches) {
            firebot.logger.info('No matches found for temperature');
            return;
        } else {
            // Don't process for `10 cats` and the like, do process for `10 Celsius`.
            if (matches[2].length > 1 && (matches[2].toLowerCase() !== 'celsius' && matches[2].toLowerCase() !== 'fahrenheit' && matches[2].toLowerCase() !== 'kelvin')) {
                return;
            }
            let amount = parseFloat(matches[1]); // 22.27
            let unit = matches[2].charAt(0).toUpperCase(); // C, F, K
            let ue = <TemperatureUnit>unit;
            let conversions: TemperatureConversions[] = [];

            switch (ue) {
                case TemperatureUnit.Celsius:
                    if (matches[2] === 'c') return;
                    conversions.push({
                        amount: (amount * 9 / 5) + 32,
                        unit: TemperatureUnit.Fahrenheit
                    });
                    conversions.push({
                        amount: amount + 273.15,
                        unit: TemperatureUnit.Kelvin
                    });
                    break;
                case TemperatureUnit.Fahrenheit:
                    conversions.push({
                        amount: (amount - 32) * 5 / 9,
                        unit: TemperatureUnit.Celsius
                    });
                    conversions.push({
                        amount: ((amount - 32) * 5 / 9) + 273.15,
                        unit: TemperatureUnit.Kelvin
                    });
                    break;
                case TemperatureUnit.Kelvin:
                    conversions.push({
                        amount: amount - 273.15,
                        unit: TemperatureUnit.Celsius
                    });
                    conversions.push({
                        amount: ((amount - 273.15) * 9 / 5) + 32,
                        unit: TemperatureUnit.Fahrenheit
                    });
                    break;
                default:
                    firebot.logger.info('We are defaulting, no matches found for temperature');

            }
            firebot.logger.info(`Conversions for temperature: ${JSON.stringify(conversions)}`);

            // TODO: Beautify later
            let response = `${amount}${unit} is equal to `;
            let conversionStrings: string[] = [];
            conversions.forEach((conversion) => {
                conversionStrings.push(`${Math.round(conversion.amount * 100) / 100}${conversion.unit}`);
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