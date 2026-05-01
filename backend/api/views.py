from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import Movie, Genre
from .serializers import MovieSerializer, GenreSerializer


@api_view(['GET'])
def health(request):
    return Response({"status": "ok"})


@api_view(['GET'])
def movie_list(request):
    """
    GET /api/movies/
    Параметры:
      ?type=movie|series   — фильтр по типу
      ?search=текст        — поиск по названию и описанию
      ?genre=id            — фильтр по жанру
      ?coming_soon=true    — только анонсы
    """
    qs = Movie.objects.prefetch_related('genres').filter(is_coming_soon=False)

    content_type  = request.GET.get('type')
    search        = request.GET.get('search', '').strip()
    genre_id      = request.GET.get('genre')
    coming_soon   = request.GET.get('coming_soon')

    if coming_soon == 'true':
        qs = Movie.objects.prefetch_related('genres').filter(is_coming_soon=True)
    elif content_type in ('movie', 'series'):
        qs = qs.filter(content_type=content_type)

    if search:
        qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

    if genre_id:
        qs = qs.filter(genres__id=genre_id)

    serializer = MovieSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def movie_detail(request, pk):
    """GET /api/movies/<id>/"""
    try:
        movie = Movie.objects.prefetch_related('genres').get(pk=pk)
    except Movie.DoesNotExist:
        return Response({"error": "Movie not found"}, status=404)
    return Response(MovieSerializer(movie).data)


@api_view(['GET'])
def genre_list(request):
    """GET /api/genres/"""
    genres = Genre.objects.all()
    return Response(GenreSerializer(genres, many=True).data)
