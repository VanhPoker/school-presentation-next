export const NAV_LIST_LEVEL = [
  {
    id: 1,
    name: "Dễ",
    value: "1",
  },
  {
    id: 2,
    name: "Trung bình",
    value: "2",
  },
  {
    id: 3,
    name: "khó",
    value: "3",
  },
];

export const NAV_LIST_POINT = [
  {
    id: 1,
    value: "0",
    name: "Không tính",
  },
  {
    id: 2,
    value: "0.25",
    name: "0.25 điểm",
  },
  {
    id: 3,
    value: "0.5",
    name: "0.5 điểm",
  },
  {
    id: 4,
    value: "0.75",
    name: "0.75 điểm",
  },
  {
    id: 5,
    value: "1",
    name: "1 điểm",
  },
  {
    id: 6,
    value: "1.25",
    name: "1.15 điểm",
  },
  {
    id: 7,
    value: "1.5",
    name: "1.5 điểm",
  },
  {
    id: 8,
    value: "1.75",
    name: "1.75 điểm",
  },
  {
    id: 9,
    value: "2",
    name: "2 điểm",
  },
];

export type AssetState = {
  name: string;
  content_preview?: string | any[] | undefined;
  asset_type: string;
  asset_url: string;
  embedded_url: string;
  file_urls: {
    url: string;
  };
};

export const ARRAY_BORDER_INPUT_COLOR = [
  "#3B82F6",
  "#EAB308",
  "#ADFF2F",
  "#FB923C",
  "#EC4899",
  "#0EA5E9",
  "#F97316",
  "#14B8A6",
  "#7C3AED",
  "#8B5CF6",
];
