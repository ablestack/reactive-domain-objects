import { __assign } from 'tslib';
import { useContext, useState, useRef, useEffect } from 'react';
import { getApolloContext } from '../context/ApolloContext.js';
import { SubscriptionData } from '../data/SubscriptionData.js';

function useSubscription(subscription, options) {
    var context = useContext(getApolloContext());
    var updatedOptions = options
        ? __assign(__assign({}, options), { subscription: subscription }) : { subscription: subscription };
    var _a = useState({
        loading: !updatedOptions.skip,
        error: undefined,
        data: undefined
    }), result = _a[0], setResult = _a[1];
    var subscriptionDataRef = useRef();
    function getSubscriptionDataRef() {
        if (!subscriptionDataRef.current) {
            subscriptionDataRef.current = new SubscriptionData({
                options: updatedOptions,
                context: context,
                setResult: setResult
            });
        }
        return subscriptionDataRef.current;
    }
    var subscriptionData = getSubscriptionDataRef();
    subscriptionData.setOptions(updatedOptions, true);
    subscriptionData.context = context;
    useEffect(function () { return subscriptionData.afterExecute(); });
    useEffect(function () { return subscriptionData.cleanup.bind(subscriptionData); }, []);
    return subscriptionData.execute(result);
}

export { useSubscription };
//# sourceMappingURL=useSubscription.js.map
