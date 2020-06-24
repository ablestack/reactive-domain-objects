import { Logger } from './logger';
import { InternalNodeKind } from '..';

const logger = Logger.make('NodeTracker');

export class NodeTracker {
  private _nodePathSeperator = '/';
  private _sourceNodeInstancePathStack = new Array<string>();
  private _sourceNodePathStack = new Array<string>();

  public pushSourceNodeInstancePathOntoStack<K extends string | number>(key: K, sourceNodeKind: InternalNodeKind) {
    logger.trace(`Adding SourceNode to sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (parent:${sourceNodeKind})`);
    this._sourceNodeInstancePathStack.push(key.toString());
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // push to typepath if objectProperty
    if (sourceNodeKind === 'Object') {
      this._sourceNodePathStack.push(key.toString());
      // reset locally cached dependencies
      this._sourceNodePath = undefined;
    }
  }

  public popSourceNodeInstancePathFromStack(sourceNodeKind: InternalNodeKind) {
    const key = this._sourceNodeInstancePathStack.pop();
    logger.trace(`Popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // pop from typepath if objectProperty
    if (sourceNodeKind === 'Object') {
      this._sourceNodePathStack.pop();
      // reset locally cached dependencies
      this._sourceNodePath = undefined;
    }
  }

  // sourceNodeInstancePath is used for persisting previous source state
  private _sourceNodeInstancePath: string | undefined;
  public getSourceNodeInstancePath(): string {
    if (!this._sourceNodeInstancePath) this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join(this._nodePathSeperator);
    return this._sourceNodeInstancePath || '';
  }

  // sourceNodePath is used for configuration generated options. It is essentially the node sourceNodeInstancePath, with the collection keys skipped. It is static, but  not unique per node
  private _sourceNodePath: string | undefined;
  public getSourceNodePath(): string {
    if (!this._sourceNodePath) this._sourceNodePath = this._sourceNodePathStack.join(this._nodePathSeperator);
    return this._sourceNodePath || '';
  }
}