import { Logger } from './logger';
import { InternalNodeKind } from '..';

const logger = Logger.make('NodeTracker');

export class NodeTracker {
  public static readonly nodePathSeperator = '/';
  private _sourceNodeInstancePathStack = new Array<string>();
  private _sourceNodeTypePathStack = new Array<string>();

  public pushSourceNodeInstancePathOntoStack(key: string | number, sourceNodeKind: InternalNodeKind) {
    logger.trace(`Node traversal - pushing SourceNode onto sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} + ${key} (parent:${sourceNodeKind})`);
    this._sourceNodeInstancePathStack.push(key.toString());
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // push to typepath if objectProperty
    if (sourceNodeKind === 'Object') {
      this._sourceNodeTypePathStack.push(key.toString());
      // reset locally cached dependencies
      this._sourceNodeTypePath = undefined;
    }
  }

  public popSourceNodeInstancePathFromStack(sourceNodeKind: InternalNodeKind) {
    const key = this._sourceNodeInstancePathStack.pop();
    logger.trace(`Node traversal - popping ${key} off sourceNodeInstancePathStack: ${this.getSourceNodeInstancePath()} (${sourceNodeKind})`);
    // reset locally cached dependencies
    this._sourceNodeInstancePath = undefined;

    // pop from typepath if objectProperty
    if (sourceNodeKind === 'Object') {
      this._sourceNodeTypePathStack.pop();
      // reset locally cached dependencies
      this._sourceNodeTypePath = undefined;
    }
  }

  // sourceNodeInstancePath is used for persisting previous source state
  private _sourceNodeInstancePath: string | undefined;
  public getSourceNodeInstancePath(): string {
    if (!this._sourceNodeInstancePath) this._sourceNodeInstancePath = this._sourceNodeInstancePathStack.join(NodeTracker.nodePathSeperator);
    return this._sourceNodeInstancePath || '';
  }

  // sourceNodeTypePath is used for configuration generated options. It is essentially the node sourceNodeInstancePath, with the collection keys skipped. It is static, but  not unique per node
  private _sourceNodeTypePath: string | undefined;
  public getSourceNodePath(): string {
    if (!this._sourceNodeTypePath) this._sourceNodeTypePath = this._sourceNodeTypePathStack.join(NodeTracker.nodePathSeperator);
    return this._sourceNodeTypePath || '';
  }
}
