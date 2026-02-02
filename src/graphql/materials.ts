// Material Types
export interface MaterialCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  materials: Material[];
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  slug?: string;
  category_id: string;
  created_at: string;
  material_views_aggregate: {
    aggregate: {
      count: number;
    };
  };
  // Can be object or array depending on API response
  material_thumbnails?: { url: string } | Array<{ url: string }>;
  material_attachments: Array<{
    file_upload?: {
      file_urls?: { url: string };
      duration?: number;
    };
    is_primary: boolean;
  }>;
  material_detail?: {
    grade?: { name: string };
    subject?: { name: string };
  };
  materials_created_infors?: {
    fullname?: string;
    avatar?: string;
  };
  material_tags?: Array<{
    tags?: { id: string; keyword: string };
  }>;
}

export interface GetMaterialCategoriesResponse {
  material_categories: MaterialCategory[];
}

// GraphQL Query for Material Categories
export const GET_MATERIAL_CATEGORIES_QUERY = `
query GetMaterialCategories($where: material_categories_bool_exp, $limit: Int, $offset: Int, $distinct_on: [material_categories_select_column!], $order_by: [material_categories_order_by!], $where_materials: materials_bool_exp, $limit_materials: Int, $offset_materials: Int, $order_by_materials: [materials_order_by!]) {
  material_categories(
    where: $where
    distinct_on: $distinct_on
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    code
    created_at
    description
    created_by
    id
    is_active
    is_deleted
    name
    materials(
      limit: $limit_materials
      offset: $offset_materials
      where: $where_materials
      order_by: $order_by_materials
    ) {
      category_id
      created_at
      created_by
      description
      detail_id
      material_views_aggregate {
        aggregate {
          count
        }
      }
      material_tags(where: {is_deleted: {_eq: false}}) {
        tags {
          id
          keyword
        }
      }
      gallery_id
      id
      slug
      is_storaged
      thumbnail
      title
      material_thumbnails {
        url
      }
      material_attachments(where: {is_deleted: {_eq: false}}) {
        file_upload {
          file_urls {
            url
          }
          duration
        }
        is_primary
      }
      material_detail {
        grade {
          name
        }
        subject {
          name
        }
      }
      materials_created_infors {
        fullname
        avatar
        email
      }
    }
  }
}
`;

// Default query variables
export const DEFAULT_MATERIAL_CATEGORIES_VARIABLES = {
  where: {
    is_deleted: { _eq: false },
  },
  limit: 1000,
  offset: 0,
  distinct_on: [],
  order_by: [],
  limit_materials: 1000,
  offset_materials: 0,
  order_by_materials: [{ created_at: "desc" }],
  where_materials: {
    is_published: { _eq: true },
    is_deleted: { _eq: false },
    is_storaged: { _eq: false },

    status: { _eq: true },
  },
};

// Category code to icon mapping
export const CATEGORY_ICONS: Record<string, string> = {
  image: "image",
  video: "video",
  "3d-vr": "3d",
  audio: "audio",
  document: "document",
  lecture: "lecture",
  interactive: "interactive",
  "scorm/xapi": "scorm",
  book: "book",
  digitaldoc: "digitaldoc",
  exam: "exam",
};
