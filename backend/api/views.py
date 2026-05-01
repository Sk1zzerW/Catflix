from django.db.models import Q
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Movie, Genre, UserRating, UserFavorite
from .serializers import MovieSerializer, GenreSerializer
@api_view(['GET'])
def csrf_token_view(request):
    return Response({'csrfToken': get_token(request)})
@api_view(['GET'])
def health(request):
    return Response({'status': 'ok'})
@api_view(['GET'])
def movie_list(request):
    coming_soon  = request.GET.get('coming_soon')
    content_type = request.GET.get('type')
    search       = request.GET.get('search', '').strip()
    genre_id     = request.GET.get('genre')
    if coming_soon == 'true':
        qs = Movie.objects.prefetch_related('genres').filter(is_coming_soon=True)
    else:
        qs = Movie.objects.prefetch_related('genres').filter(is_coming_soon=False)
        if content_type in ('movie', 'series'):
            qs = qs.filter(content_type=content_type)
    if search:
        qs = qs.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(genres__name__icontains=search)
        ).distinct()
    if genre_id:
        try:
            qs = qs.filter(genres__id=int(genre_id)).distinct()
        except ValueError:
            pass
    data = MovieSerializer(qs, many=True).data
    if request.user.is_authenticated:
        fav_ids = set(
            UserFavorite.objects.filter(user=request.user)
            .values_list('movie_id', flat=True)
        )
        for item in data:
            item['is_favorite'] = item['id'] in fav_ids
    else:
        for item in data:
            item['is_favorite'] = False
    return Response(data)
@api_view(['GET'])
def movie_detail(request, pk):
    try:
        movie = Movie.objects.prefetch_related('genres', 'user_ratings').get(pk=pk)
    except Movie.DoesNotExist:
        return Response({'error': 'Movie not found'}, status=404)
    data = MovieSerializer(movie).data
    data['my_rating']   = None
    data['is_favorite'] = False
    if request.user.is_authenticated:
        try:
            ur = UserRating.objects.get(user=request.user, movie=movie)
            data['my_rating'] = ur.score
        except UserRating.DoesNotExist:
            pass
        data['is_favorite'] = UserFavorite.objects.filter(
            user=request.user, movie=movie).exists()
    return Response(data)
@csrf_exempt
@api_view(['POST'])
def rate_movie(request, pk):
    if not request.user.is_authenticated:
        return Response({'error': 'Login required'}, status=401)
    try:
        movie = Movie.objects.get(pk=pk)
    except Movie.DoesNotExist:
        return Response({'error': 'Movie not found'}, status=404)
    try:
        score = int(request.data.get('score', 0))
    except (TypeError, ValueError):
        return Response({'error': 'score must be integer'}, status=400)
    if not 1 <= score <= 10:
        return Response({'error': 'score must be 1-10'}, status=400)
    ur, created = UserRating.objects.update_or_create(
        user=request.user, movie=movie,
        defaults={'score': score}
    )
    return Response({
        'message': 'Rating saved',
        'score': ur.score,
        'avg_user_rating': movie.avg_user_rating(),
    }, status=201 if created else 200)
@csrf_exempt
@api_view(['POST'])
def toggle_favorite(request, pk):
    if not request.user.is_authenticated:
        return Response({'error': 'Login required'}, status=401)
    try:
        movie = Movie.objects.get(pk=pk)
    except Movie.DoesNotExist:
        return Response({'error': 'Movie not found'}, status=404)
    fav, created = UserFavorite.objects.get_or_create(user=request.user, movie=movie)
    if not created:
        fav.delete()
        return Response({'is_favorite': False, 'message': 'Removed from favorites'})
    return Response({'is_favorite': True, 'message': 'Added to favorites'}, status=201)
@api_view(['GET'])
def my_favorites(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Login required'}, status=401)
    fav_movies = Movie.objects.prefetch_related('genres').filter(
        favorited_by__user=request.user
    ).order_by('-favorited_by__created_at')
    data = MovieSerializer(fav_movies, many=True).data
    for item in data:
        item['is_favorite'] = True
    return Response(data)
@api_view(['GET'])
def genre_list(request):
    return Response(GenreSerializer(Genre.objects.all(), many=True).data)
