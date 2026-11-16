import firebot, {TriggeredEvent} from "@crowbartools/firebot-types";

import {PluginEventHandler} from "@crowbartools/firebot-types/types/plugin-api";

type DistanceConversions = {
    fromUnit: DistanceUnit
    amount: number,
    toUnit: DistanceUnit,
}

enum DistanceUnit {
    Meter = 'm',
    Mile = 'mi',
    Yard = 'yard',
    Foot = 'ft',
    Inch = 'inch',
    Centimeter = 'cm',
    Kilometer = 'km',
}

export class DistanceConverter {
    public static chatMessageHandler: PluginEventHandler = (event: TriggeredEvent): string | undefined => {
        let validUnits = [
            'meters',
            'meter',
            'm',
            'cm',
            'km',
            'kilometer',
            'kilometers',
            'mile',
            'miles',
            'yard',
            'yards',
            'feet',
            'foot',
            'ft',
            'inches',
            'inch',
            '"',
            '\'',
        ];
        // @ts-ignore
        let message = <string>event.meta.messageText;
        let messageId = <string>event.meta.messageId;

        const muricaRegex = new RegExp(/(?:^|\s)(\d+[.,]?\d*)\s?(')\s?(\d+[.,]?\d*)\s?(")/gi);
        const distanceRegex = new RegExp(/(?:^|\s)(-?\d+[.,]?\d*)\s?((cm|m|km|kilometers?|ft|foot|feet|inch|"|'|miles?|yards?)\w*)/gi);

        let muricaMatches = muricaRegex.exec(message.replaceAll(',', '.'));
        let distanceMatches = distanceRegex.exec(message.replaceAll(',', '.'));
        if (!distanceMatches && !muricaMatches) {
            firebot.logger.info('No matches found for distance');
            return;
        } else if (muricaMatches) {
            let feet = parseFloat(muricaMatches[1]);
            let inches = parseFloat(muricaMatches[3]);
            let meters = ((feet * 12) + inches) * 0.0254;

            let response = `${feet}'${inches}" is equal to ${Math.round(meters * 100) / 100} meters`;
            firebot.twitch.api.chat.sendChatMessage(response, messageId, true).then((result) => {
                firebot.logger.info(`Responded with ${response}`);
            }).catch((err) => {
                firebot.logger.error(`Could not send chat message. ${JSON.stringify(err)}`);
            });
        } else if (distanceMatches) {
            let amount = parseFloat(distanceMatches[1]); // 22.27
            let unit = distanceMatches[2].toLowerCase().replaceAll('/', ''); // kmh
            if (!validUnits.includes(distanceMatches[2])) {
                return;
            }
            switch (unit) {
                case 'meters':
                    unit = 'm';
                    break;
                case 'meter':
                    unit = 'm';
                    break;
                case 'cm':
                    unit = 'm';
                    amount /= 100;
                    break;
                case 'km':
                    unit = 'm';
                    amount *= 1000;
                    break;
                case 'kilometer':
                    unit = 'm';
                    amount *= 1000;
                    break;
                case 'kilometers':
                    unit = 'm';
                    amount *= 1000;
                    break;
                case 'yard':
                    unit = 'yard';
                    break;
                case 'yards':
                    unit = 'yard';
                    break;
                case 'mile':
                    unit = 'mi';
                    break;
                case 'miles':
                    unit = 'mi';
                    break;
                case 'feet':
                    unit = 'ft';
                    break;
                case 'foot':
                    unit = 'ft';
                    break;
                case '"':
                    unit = 'inch';
                    break;
                case '\'':
                    unit = 'ft';
                    break;
                default:
                    break;
            }
            let ue = <DistanceUnit>unit;
            let conversions: DistanceConversions[] = [];

            switch (ue) {
                case DistanceUnit.Meter:
                    if (amount < 1) {
                        conversions.push({
                            fromUnit: DistanceUnit.Meter,
                            amount: amount / 0.0254,
                            toUnit: DistanceUnit.Inch,
                        });
                    } else if (amount < 25) {
                        conversions.push({
                            fromUnit: DistanceUnit.Meter,
                            amount: amount / (12 * 0.0254),
                            toUnit: DistanceUnit.Foot,
                        });
                    } else if (amount < 1000) {
                        conversions.push({
                            fromUnit: DistanceUnit.Meter,
                            amount: amount / (36 * 0.0254),
                            toUnit: DistanceUnit.Yard,
                        });
                    } else {
                        conversions.push({
                            fromUnit: DistanceUnit.Meter,
                            amount: amount / 1600.9,
                            toUnit: DistanceUnit.Mile,
                        });
                    }
                    break;
                case DistanceUnit.Mile:
                    conversions.push({
                        fromUnit: DistanceUnit.Mile,
                        amount: amount * 1600.9,
                        toUnit: DistanceUnit.Meter,
                    });
                    break;
                case DistanceUnit.Yard:
                    conversions.push({
                        fromUnit: DistanceUnit.Yard,
                        amount: amount * 36 * 0.0254,
                        toUnit: DistanceUnit.Meter,
                    });
                    break;
                case DistanceUnit.Foot:
                    conversions.push({
                        fromUnit: DistanceUnit.Foot,
                        amount: amount * 12 * 0.0254,
                        toUnit: DistanceUnit.Meter,
                    });
                    break;
                case DistanceUnit.Inch:
                    conversions.push({
                        fromUnit: DistanceUnit.Inch,
                        amount: amount * 0.0254,
                        toUnit: DistanceUnit.Meter,
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
                if (conversion.fromUnit === DistanceUnit.Meter && conversion.toUnit === DistanceUnit.Foot) {
                    let feet = conversion.amount;
                    let feet_remaining = conversion.amount - Math.floor(feet);
                    let inches = Math.round(feet_remaining * 12);

                    conversionStrings.push(`${amount} m is about ${Math.floor(feet)}'${inches}"`);
                } else {
                    if (conversion.fromUnit === DistanceUnit.Meter) {
                        if (amount < 1) {
                            amount *= 100;
                            unit = 'cm';
                        } else if (amount >= 1000) {
                            amount /= 1000;
                            unit = 'km';
                        }
                    }
                    if (conversion.toUnit === DistanceUnit.Meter) {
                        if (conversion.amount < 1) {
                            conversion.amount *= 100;
                            conversion.toUnit = DistanceUnit.Centimeter;
                        } else if (conversion.amount >= 1000) {
                            conversion.amount /= 1000;
                            conversion.toUnit = DistanceUnit.Kilometer;
                        }

                    }
                    conversionStrings.push(`${amount} ${unit} is ${Math.round(conversion.amount * 100) / 100} ${conversion.toUnit}`);
                }
            })
            let response = conversionStrings.join(' or ');

            firebot.twitch.api.chat.sendChatMessage(response, messageId, true).then((result) => {
                firebot.logger.info(`Responded with ${response}`);
            }).catch((err) => {
                firebot.logger.error(`Could not send chat message. ${JSON.stringify(err)}`);
            });
        }
    }

}