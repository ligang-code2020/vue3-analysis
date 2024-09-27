const Transiton = {
  name: 'Transiton',
  setup(props, { slots }) {
    return () => {
      // 通过默认插槽获取需要过滤的元素
      const innerVNode = slots.default();
      // 在过渡元素的 VNode 对象上添加 transition 相应的钩子函数
      innerVNode.transiton = {
        beforeEnter(el) {
          // 设置初始状态：添加 enter-from 和 enter-active 类
          el.classList.add('enter-from');
          el.classList.add('enter-active');
        },
        enter(el) {
          // 在下一帧切换到结束状态
          nextFrame(() => {
            // 移除 enter-from 类，添加 enter-to 类
            el.classList.remove('enter-from');
            el.classList.add('enter-to');
            // 监听 transitionend 事件完成收尾工作
            el.addEventListener('transitionend', () => {
              el.classList.remove('enter-to');
              el.classList.remove('enter-active');
            });
          });
        },
        leave(el, performance) {
          // 设置离场过渡的初始状态：添加 leave-from 和 leave-active

          el.classList.add('leave-from');
          el.classList.add('leave-active');
          // 强制 reflow，使得初始状态生效
          document.body.offsetHeight;
          // 在下一帧修改状态
          nextFrame(() => {
            // 移除 leave-from 类，添加 leave-to 类
            el.classList.remove('leave-from');
            el.classList.add('leave-to');

            // 监听 transitionend 事件完成收尾工作
            el.addEventListener('transitionend', () => {
                el.classList.remove('leave-to');
                el.classList.remove('leave-active');
                // 调用 transition.leave 钩子函数的第二个参数，完成 DOM 元素的卸载
                performRemove()
            });
          });
        },
      };
    };

    // 渲染需要过渡的元素
    return innerVNode;
  },
};

function mountElement(vnode, container, anchor) {
  const el = (vnode.el = createElement(vnode.type));

  // ...

  // 判断一个 VNode 是否需要过渡
  const needTransition = vnode.transiton;
  if (needTransition) {
    // 调用 transition.beforeEnter 钩子，并将 DOM 元素作为参数传递
    vnode.transiton.beforeEnter(el);
  }
  insert(el, container, anchor);
  if (needTransition) {
    // 调用 transition.enter 钩子，并将 DOM 元素作为参数传递
    vnode.transiton.enter(el);
  }
}

function unmount(vnode) {
  // 判断 VNode 是否需要过滤处理
  const needTransition = vnode.transiton;
  if (vnode.type === Fragment) {
    vnode.children.forEach((c) => unmount(c));
  } else if (typeof vnode.type === 'object') {
    if (vnode.shouldKeepAlive) {
      vnode.keepAliveInstance._deActivate(vnode);
    } else {
      unmount(vnode.component.subTree);
    }

    return;
  }
  const parent = vnode.el.parentNode;
  if (parent) {
    // 将卸载动作封装到 performRemove 函数中
    const performRemove = () => parent.removeChild(vnode.el);
    if (needTransition) {
      // 如果需要过渡处理，则调用 transition.leave 钩子
      // 同时将 DOM 元素和 performRemove 函数作为参数传递
      vnode.transiton.leave(vnode.el, performRemove);
    } else {
      // 如果不需要过渡处理，则直接执行卸载操作
      performRemove();
    }
  }
}
