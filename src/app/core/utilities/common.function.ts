import moment from "moment";

export function IsEmptyObject(obj: any) {
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  else return false;
}

export function groupBy(column: string, data: any[], reducedGroups?: any[]) {
  if (!column) return data;
  let collapsedGroups = reducedGroups;
  if (!reducedGroups) collapsedGroups = [];
  const customReducer = (accumulator, currentValue) => {
    let currentGroup = currentValue[column];
    if (!accumulator[currentGroup])
      accumulator[currentGroup] = [
        {
          groupName: `${currentValue[column]}`,
          value: currentValue[column],
          isGroup: true,
          reduced: collapsedGroups.some(
            (group) => group.value == currentValue[column]
          ),
        },
      ];

    accumulator[currentGroup].push(currentValue);

    return accumulator;
  };
  let groups = data.reduce(customReducer, {});
  let groupArray = Object.keys(groups).map((key) => groups[key]);
  let flatList = groupArray.reduce((a, c) => {
    return a.concat(c);
  }, []);
  return flatList.filter((rawLine) => {
    return (
      rawLine.isGroup ||
      collapsedGroups.every((group) => rawLine[column] != group.value)
    );
  });
}
export function GetDate(
  date?: any,
  format: string = "YYYY-MM-DD HH:mm:ss"
): string {
  let jsonDate;
  if (date) jsonDate = new Date(date);
  else jsonDate = new Date();
  return moment.utc(jsonDate).format(format);
}
