class Actions {
  // 默认值为空 Action
  actions = {};

  /**
   * 设置 actions
   */
  setActions(actions: any) {
    this.actions = actions;
  }
  
  getState(){
    return this.actions.globalState
  }

  /**
   * 映射
   */
  onGlobalStateChange(cb, fireImmediately?: boolean) {
    return this.actions.onGlobalStateChange(cb, fireImmediately);
  }

  /**
   * 映射
   */
  setGlobalState(state: Record<string, any>) {
    return this.actions.setGlobalState(state);
  }
}

const actions = new Actions();
export default actions;
