import { injectable } from 'inversify';

import { IConfigFileParser } from '..';
import { Configuration, SortingConfigurationEntry } from '../../../models';
import { SortingConfigurationEntryFactory } from './helpers';

@injectable()
export class ConfigFileParser implements IConfigFileParser {
  public parseLintConfiguration(tsLintContent: string): Configuration {
    const configEntries = this.parseConfigLines(tsLintContent);
    return new Configuration(configEntries);
  }

  private parseMemberOrderingRule(tsLintContent: string): string {
    const startIndex = tsLintContent.indexOf('"member-ordering"');

    let result = '';
    let foundClosingBracket = 0;

    for (let i = startIndex; i <= tsLintContent.length; i++) {
      const curentChar = tsLintContent[i];
      result += curentChar;

      if (curentChar === ']') {
        foundClosingBracket++;
      }

      if (foundClosingBracket === 2) {
        break;
      }
    }

    return result;
  }

  private parseConfigLines(tsLintContent: string): SortingConfigurationEntry[] {
    const result = new Array<SortingConfigurationEntry>();
    const configString = this.parseMemberOrderingRule(tsLintContent);
    const configLines = configString.split('\n');

    const orderLine = configLines.find(f => f.indexOf('"order"') > -1)!;
    const orderLineIndex = configLines.indexOf(orderLine);

    let lineSequence = 0;

    for (let i = orderLineIndex + 1; i <= configLines.length; i++) {
      const currentLine = configLines[i];
      if (currentLine.indexOf(']') > -1) {
        break;
      }

      const configLine = SortingConfigurationEntryFactory.parseFromLine(currentLine, lineSequence++);
      result.push(configLine);
    }

    return result;
  }
}
