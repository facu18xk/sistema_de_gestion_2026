namespace api.Dtos.Common;

public class PaginationQueryDto
{
    private const int DefaultPage = 1;
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    public int Page { get; set; } = DefaultPage;

    public int PageSize { get; set; } = DefaultPageSize;

    public int GetNormalizedPage()
    {
        return Page < 1 ? DefaultPage : Page;
    }

    public int GetNormalizedPageSize()
    {
        if (PageSize < 1)
        {
            return DefaultPageSize;
        }

        return PageSize > MaxPageSize ? MaxPageSize : PageSize;
    }
}

public class PagedResultDto<T>
{
    public IReadOnlyCollection<T> Items { get; set; } = Array.Empty<T>();

    public int Page { get; set; }

    public int PageSize { get; set; }

    public int TotalCount { get; set; }

    public int TotalPages { get; set; }

    public bool HasPreviousPage { get; set; }

    public bool HasNextPage { get; set; }
}
