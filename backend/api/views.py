import json
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Movie, Genre, UserRating
from .serializers import MovieSerializer, GenreSerializer, UserRatingSerializer


@api_view(['GET'])
def health(request):
    return Response({"status": "ok"})


@api_view(['GET'])
def movie_list(request):
    """
    GET /api/movies/
    ?type=movie|series     — тип контента
    ?search=текст          — поиск по названию и описанию (частичное совпадение)
    ?genre=id              — фильтр по жанру
    ?coming_soon=true      — только анонсы
    """
    coming_soon  = request.GET.get('coming_soon')
    content_type = request.GET.get('type')
    search       = request.GET.get('search', '').strip()
    genre_id     = request.GET.get('genre')

    # Базовый queryset
    if coming_soon == 'true':
        qs = Movie.objects.prefetch_related('genres').filter(is_coming_soon=True)
    else:
        qs = Movie.objects.prefetch_related('genres').filter(is_coming_soon=False)
        if content_type in ('movie', 'series'):
            qs = qs.filter(content_type=content_type)

    # Поиск — частичное совпадение по title ИЛИ description ИЛИ жанру
    if search:
        qs = qs.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(genres__name__icontains=search)
        ).distinct()

    # Фильтр по жанру
    if genre_id:
        try:
            qs = qs.filter(genres__id=int(genre_id)).distinct()
        except ValueError:
            pass

    return Response(MovieSerializer(qs, many=True).data)


@api_view(['GET'])
def movie_detail(request, pk):
    """GET /api/movies/<id>/"""
    try:
        movie = Movie.objects.prefetch_related('genres', 'user_ratings').get(pk=pk)
    except Movie.DoesNotExist:
        return Response({"error": "Movie not found"}, status=404)

    data = MovieSerializer(movie).data

    # Рейтинг текущего пользователя (если авторизован)
    data['my_rating'] = None
    if request.user.is_authenticated:
        try:
            ur = UserRating.objects.get(user=request.user, movie=movie)
            data['my_rating'] = ur.score
        except UserRating.DoesNotExist:
            pass

    return Response(data)


@api_view(['POST'])
def rate_movie(request, pk):
    """
    POST /api/movies/<id>/rate/
    Body: { "score": 1-10 }
    Создаёт или обновляет оценку пользователя.
    """
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=401)

    try:
        movie = Movie.objects.get(pk=pk)
    except Movie.DoesNotExist:
        return Response({"error": "Movie not found"}, status=404)

    try:
        score = int(request.data.get('score', 0))
    except (TypeError, ValueError):
        return Response({"error": "score must be an integer"}, status=400)

    if not 1 <= score <= 10:
        return Response({"error": "score must be between 1 and 10"}, status=400)

    rating, created = UserRating.objects.update_or_create(
        user=request.user, movie=movie,
        defaults={'score': score}
    )

    return Response({
        "message": "Rating saved",
        "score": rating.score,
        "avg_user_rating": movie.avg_user_rating(),
    }, status=201 if created else 200)


@api_view(['GET'])
def genre_list(request):
    """GET /api/genres/"""
    return Response(GenreSerializer(Genre.objects.all(), many=True).data)
