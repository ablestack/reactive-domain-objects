import { MutationDataOptions, MutationTuple, MutationResult } from '../types/types';
import { OperationData } from './OperationData';
import { OperationVariables } from '../../core/types';
export declare class MutationData<TData = any, TVariables = OperationVariables> extends OperationData {
    private mostRecentMutationId;
    private result;
    private previousResult?;
    private setResult;
    constructor({ options, context, result, setResult }: {
        options: MutationDataOptions<TData, TVariables>;
        context: any;
        result: MutationResult<TData>;
        setResult: (result: MutationResult<TData>) => any;
    });
    execute(result: MutationResult<TData>): MutationTuple<TData, TVariables>;
    afterExecute(): any;
    cleanup(): void;
    private runMutation;
    private mutate;
    private onMutationStart;
    private onMutationCompleted;
    private onMutationError;
    private generateNewMutationId;
    private isMostRecentMutation;
    private updateResult;
}
//# sourceMappingURL=MutationData.d.ts.map