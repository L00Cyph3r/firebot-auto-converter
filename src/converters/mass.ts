import firebot, {TriggeredEvent} from "@crowbartools/firebot-types";

import {PluginEventHandler} from "@crowbartools/firebot-types/types/plugin-api";

type MassConversions = {
    amount: number,
    unit: MassUnit,
}

enum MassUnit {
    Gram = 'g',
    Pound = 'lb',
    Stone = 'st',
    Ounce = 'oz',
}

export class MassConverter {
    public static chatMessageHandler: PluginEventHandler = (event: TriggeredEvent): string | undefined => {
        // @ts-ignore
        let message = <string>event.meta.messageText;
        let messageId = <string>event.meta.messageId;
        let validUnits = [
            'g',
            'gr',
            'gram',
            'grams',
            'kg',
            'kilogram',
            'kilograms',
            'lb',
            'lbs',
            'st',
            'stone',
            'stones',
            'oz',
        ];

        const massRegex = new RegExp(/(?:^|\s)(-?\d+[.,]?\d*)\s?((k|kilo)?(grams|gram|gr|g)\w*|(lbs?|st|stone|oz)\w*)/gi);
        let matches = massRegex.exec(message.replaceAll(',', '.'));
        if (!matches) {
            firebot.logger.info('No matches found for mass');
            return;
        } else {
            // Don't process for `10 cats` and the like, do process for `10 Celsius`.
            if (!validUnits.includes(matches[2])) {
                return;
            }
            let amount = parseFloat(matches[1]); // 22.27
            let unit = matches[2].toLowerCase(); // kmh
            switch (unit) {
                case 'kg':
                    unit = 'g';
                    amount *= 1000;
                    break;
                case 'kilogram':
                    unit = 'g';
                    amount *= 1000;
                    break;
                case 'kilograms':
                    unit = 'g';
                    amount *= 1000;
                    break;
                case 'grams':
                    unit = 'g';
                    break;
                case 'gram':
                    unit = 'g';
                    break;
                case 'gr':
                    unit = 'g';
                    break;
                case 'lbs':
                    unit = 'lb';
                    break;
                case 'stone':
                    unit = 'st';
                    break;
                default:
                    break;
            }
            let ue = <MassUnit>unit;
            let conversions: MassConversions[] = [];

            switch (ue) {
                case MassUnit.Gram:
                    if (amount >= 1000) {
                        conversions.push({
                            amount: amount / 453.6,
                            unit: MassUnit.Pound,
                        });
                        conversions.push({
                            amount: amount / 6350,
                            unit: MassUnit.Stone,
                        });

                    } else {
                        conversions.push({
                            amount: amount / 28.35,
                            unit: MassUnit.Ounce,
                        });
                    }
                    break;
                case MassUnit.Ounce:
                    conversions.push({
                        amount: amount * 28.35,
                        unit: MassUnit.Gram
                    });
                    break;
                case MassUnit.Pound:
                    conversions.push({
                        amount: amount * 453.592,
                        unit: MassUnit.Gram
                    });
                    conversions.push({
                        amount: amount / 14,
                        unit: MassUnit.Stone
                    });
                    break;
                case MassUnit.Stone:
                    conversions.push({
                        amount: amount * 6350.29,
                        unit: MassUnit.Gram
                    });
                    conversions.push({
                        amount: amount * 14,
                        unit: MassUnit.Pound
                    });
                    break;

                default:
                    firebot.logger.info('We are defaulting, no matches found for mass');
                    return;

            }

            firebot.logger.info(`Conversions for mass: ${JSON.stringify(conversions)}`);

            // TODO: Beautify later
            if (unit === MassUnit.Gram && amount >= 1000) {
                unit = 'kg';
                amount /= 1000;
            }
            let response = `${amount} ${unit} is equal to `;
            let conversionStrings: string[] = [];
            conversions.forEach((conversion) => {
                unit = conversion.unit;
                amount = conversion.amount;
                if (conversion.unit === MassUnit.Gram && conversion.amount >= 1000) {
                    unit = 'kg';
                    amount /= 1000;
                }
                conversionStrings.push(`${Math.round(amount * 100) / 100} ${unit}`);
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