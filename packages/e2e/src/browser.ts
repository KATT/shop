import { NightwatchBrowser } from 'nightwatch';

export interface Browser extends NightwatchBrowser {
  setSelectorValue(selector: string, value: any): this;
}

export default Browser;
