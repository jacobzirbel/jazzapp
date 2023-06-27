import { inject, injectable } from "tsyringe";
import { JDependency } from "../interfaces";
import { JLogger } from "./logger";
import { JUtilities } from "./utilities";

export interface IBrowser {
  close(): Promise<void>;
}

export interface IPage {
  url(): Promise<string>;
  goto(url: string, options?: { timeout: number }): Promise<void>;
}

export class JScraperHelper {
  isInitialized: boolean = false;

  mainUrl = '';
  isTesting: boolean | undefined;

  logger: JLogger;
  utilities: JUtilities;

  constructor(private browser: IBrowser, private page: IPage) {
    this.logger = new JLogger();
    this.utilities = new JUtilities();
  }

  async loadPage(url?: string) {
    await this.page.goto(url || this.mainUrl, { timeout: 0 });
  }

  async customUrlAwait(expectedUrl: string) {
    let url = '';
    let n = 0;
    while (url !== expectedUrl && n < 30) {
      if (n % 5 === 0 && n > 5) {
        this.logger.info(`getFinalResults url delay - ${n}s`);
      }
      await this.utilities.delay(1000);
      url = await this.page.url();
    };
    if (url !== expectedUrl) {
      throw new Error(`Failed to get to url - actual: ${url} - want: ${expectedUrl}`);
    }
  }

  async destroy() {
    await this.browser?.close();
  }
}
