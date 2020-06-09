import { equal } from '@wry/equality';
import { useRef } from 'react';

function useDeepMemo(memoFn, key) {
    var ref = useRef();
    if (!ref.current || !equal(key, ref.current.key)) {
        ref.current = { key: key, value: memoFn() };
    }
    return ref.current.value;
}

export { useDeepMemo };
//# sourceMappingURL=useDeepMemo.js.map
