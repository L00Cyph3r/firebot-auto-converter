import firebot, {TriggeredEvent} from "@crowbartools/firebot-types";

import {PluginEventHandler} from "@crowbartools/firebot-types/types/plugin-api";

type FluidVolumeConversions = {
    fromUnit: FluidUnit;
    amount: number,
    toUnit: FluidUnit,
}

enum FluidUnit {
    Litre = 'l',
    Gallon = 'gal',
    USGallon = 'gal (US)',
    UKGallon = 'gal (Imp)',
}

export class FluidVolumeConverter {
    public static chatMessageHandler: PluginEventHandler = (event: TriggeredEvent): string | undefined => {
        let validUnits = [
            'litre',
            'litres',
            'liter',
            'liters',
            'ltr',
            'l',
            'gal',
            'gals',
            'gallon',
            'gallons',
        ];
        // @ts-ignore
        let message = <string>event.meta.messageText;
        let messageId = <string>event.meta.messageId;

        const speedRegex = new RegExp(/(?:^|\s)(\d+[.,]?\d*)\s?((litres?|liters?|ltr|l|gallon|gal)\w*)/gi);
        let matches = speedRegex.exec(message.replaceAll(',', '.'));
        if (!matches) {
            firebot.logger.info('No matches found for fluid volume');
            return;
        } else {
            let amount = parseFloat(matches[1]); // 22.27
            let unit = matches[2].toLowerCase().replaceAll('/', ''); // kmh
            if (!validUnits.includes(matches[2])) {
                return;
            }
            switch (unit) {
                case 'litre':
                    unit = 'l';
                    break;
                case 'liter':
                    unit = 'l';
                    break;
                case 'litres':
                    unit = 'l';
                    break;
                case 'liters':
                    unit = 'l';
                    break;
                case 'ltr':
                    unit = 'l';
                    break;
                case 'gal':
                    unit = 'gal';
                    break;
                case 'gals':
                    unit = 'gal';
                    break;
                case 'gallon':
                    unit = 'gal';
                    break;
                case 'gallons':
                    unit = 'gal';
                    break;
                default:
                    break;
            }
            let ue = <FluidUnit>unit;
            let conversions: FluidVolumeConversions[] = [];

            switch (ue) {
                case FluidUnit.Litre:
                    conversions.push({
                        fromUnit: FluidUnit.Litre,
                        amount: amount / 3.78541,
                        toUnit: FluidUnit.USGallon,
                    });
                    conversions.push({
                        fromUnit: FluidUnit.Litre,
                        amount: amount / 4.54609,
                        toUnit: FluidUnit.UKGallon,
                    });
                    break;
                case FluidUnit.Gallon:
                    conversions.push({
                        fromUnit: FluidUnit.USGallon,
                        amount: amount * 4.54609,
                        toUnit: FluidUnit.Litre,
                    });
                    conversions.push({
                        fromUnit: FluidUnit.UKGallon,
                        amount: amount * 3.78541,
                        toUnit: FluidUnit.Litre,
                    });
                    break;
                default:
                    firebot.logger.info('We are defaulting, no matches found for speed');
                    return;

            }

            firebot.logger.info(`Conversions for speed: ${JSON.stringify(conversions)}`);

            // TODO: Beautify later
            let conversionStrings: string[] = [];
            conversions.forEach((conversion) => {
                conversionStrings.push(`${amount} ${conversion.fromUnit} equals ${Math.round(conversion.amount * 100) / 100} ${conversion.toUnit}`);
            })
            let response = conversionStrings.join('; ');

            firebot.twitch.api.chat.sendChatMessage(response, messageId, true).then((result) => {
                firebot.logger.info(`Responded with ${response}`);
            }).catch((err) => {
                firebot.logger.error(`Could not send chat message. ${JSON.stringify(err)}`);
            });
        }
    }

}