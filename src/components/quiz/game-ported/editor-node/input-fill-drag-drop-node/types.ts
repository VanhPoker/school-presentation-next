export interface InputChildProps {
  isTable?: boolean;
  valueInput?: string;
  item_drop?: any;
  childrenList?: any;
  latexValue?: string;
  id?: string;
  handleChangeInputValue?: (value: string, id?: string) => void;
  handleAddContentAnswer?: () => void;
  handleNodeRemove?: () => void;
}
