from rest_framework import viewsets, permissions
from .models import Zupanija, Grad, Korisnik, Kategorija, Oglas, Slika, Favorit, Pregled
from .serializers import ZupanijaSerializer, GradSerializer, KorisnikSerializer, KategorijaSerializer, OglasSerializer, SlikaSerializer, FavoritSerializer
from .forms import FormaZaRegistraciju, FormaZaIzraduOglasa, SlikaForma, AzuriranjeKorisnikaForma, PromjenaLozinkeForma
from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.decorators import api_view
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
import base64
from rest_framework import filters
from rest_framework import viewsets
from django.forms.models import model_to_dict
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
import os
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.contrib.auth import update_session_auth_hash
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
class ZupanijaViewSet(viewsets.ModelViewSet):
    queryset = Zupanija.objects.all()
    serializer_class = ZupanijaSerializer

class GradViewSet(viewsets.ModelViewSet):
    queryset = Grad.objects.all()
    serializer_class = GradSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['naziv']

    def get_queryset(self):
        queryset = Grad.objects.all()
        zupanija_id = self.request.query_params.get('zupanija') 
        if zupanija_id:
            queryset = queryset.filter(zupanija_id=zupanija_id)
        return queryset

class KorisnikViewSet(viewsets.ModelViewSet):
    queryset = Korisnik.objects.all()
    serializer_class = KorisnikSerializer

class KategorijaViewSet(viewsets.ModelViewSet):
    queryset = Kategorija.objects.all()
    serializer_class = KategorijaSerializer

class OglasViewSet(viewsets.ModelViewSet):
    queryset = Oglas.objects.all()
    serializer_class = OglasSerializer

class SlikaViewSet(viewsets.ModelViewSet):
    queryset = Slika.objects.all()
    serializer_class = SlikaSerializer

class FavoritViewSet(viewsets.ModelViewSet):
    queryset = Favorit.objects.all()
    serializer_class = FavoritSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorit.objects.filter(korisnik=self.request.user)

    def perform_create(self, serializer):
        serializer.save(korisnik=self.request.user)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def dodaj(self, request):
        oglas_id = request.data.get('oglas')
        oglas = Oglas.objects.get(id=oglas_id)
        favorit, created = Favorit.objects.get_or_create(korisnik=request.user, oglas=oglas)
        if created:
            return Response({'status': 'Oglas je dodan u favorite'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'status': 'Oglas je već u favoritima'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def ukloni(self, request):
        oglas_id = request.data.get('oglas')
        oglas = Oglas.objects.get(id=oglas_id)
        favorit = Favorit.objects.filter(korisnik=request.user, oglas=oglas)
        if favorit.exists():
            favorit.delete()
            return Response({'status': 'Oglas je uklonjen iz favorita'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'status': 'Oglas nije pronađen u favoritima'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def moji_favoriti(self, request):
        favoriti = Favorit.objects.filter(korisnik=request.user)
        oglasi = [favorit.oglas for favorit in favoriti]
        oglasi_data = OglasSerializer(oglasi, many=True).data

        for oglas in oglasi_data:
            slike = Slika.objects.filter(oglas_id=oglas['id'])
            slike_data = SlikaSerializer(slike, many=True).data
            oglas['slike'] = [slika['slika'] for slika in slike_data]

        return Response({'oglasi': oglasi_data})
    
def registracija(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        form = FormaZaRegistraciju(data)
        if form.is_valid():
            oib = form.cleaned_data['oib']
            if Korisnik.objects.filter(oib=oib).exists():
                form.add_error('oib', 'OIB mora biti jedinstven.')
            else:
                form.save()
                return JsonResponse({'success': True}, status=201)
        return JsonResponse(form.errors, status=400)
    else:
        form = FormaZaRegistraciju()
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def azuriraj_korisnika(request):
    try:
        korisnik = request.user
    except Korisnik.DoesNotExist:
        return Response({'error': 'Korisnik nije pronađen.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        form = AzuriranjeKorisnikaForma(request.data, instance=korisnik)
        if form.is_valid():
            form.save()
            return Response({'success': 'Podaci korisnika su uspješno ažurirani.'}, status=status.HTTP_200_OK)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def promjena_lozinke(request):
    form = PromjenaLozinkeForma(user=request.user, data=request.data)
    if form.is_valid():
        user = form.save()
        update_session_auth_hash(request, user)
        return Response({'success': 'Lozinka je uspješno promijenjena.'}, status=status.HTTP_200_OK)
    return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trenutni_korisnik(request):
    user = request.user
    user_info = {
        'id': user.id,
        'korisnicko_ime': user.username,
        'ime': user.first_name or 'N/A',
        'prezime': user.last_name or 'N/A',
        'email': user.email,
        'telefon': user.telefon,
        'oib': user.oib,
        'datum_pridruzivanja': user.date_joined.strftime("%d/%m/%Y %H:%M:%S"),
        'grad': user.grad.naziv if user.grad else 'N/A',
        'zupanija': user.zupanija.naziv if user.zupanija else 'N/A',
        'grad_id': user.grad.id if user.grad else None,
        'zupanija_id': user.zupanija.id if user.zupanija else None,
        'is_superuser': user.is_superuser,
        'is_staff': user.is_staff,
        'uloga': 'Admin' if user.is_superuser else 'Staff' if user.is_staff else 'Korisnik'
    }
    return JsonResponse(user_info)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def odjavi_korisnika(request):
    logout(request)
    return JsonResponse({'message': 'Uspješno ste odjavljeni.'})

@login_required
def profil(request):
    user = request.user
    return render(request, {'user': user})

@api_view(['POST'])
@login_required
def kreiraj_oglas(request):
    if request.method == 'POST':
        oglas_form = FormaZaIzraduOglasa(request.POST)
        slike = request.FILES.getlist('slike')

        if oglas_form.is_valid() and slike:
            oglas = oglas_form.save(commit=False)
            oglas.korisnik = request.user
            oglas.save()

            for slika in slike:
                Slika.objects.create(oglas=oglas, slika=slika)

            return Response({'success': 'Oglas je uspješno kreiran.'}, status=201)
        else:
            errors = {
                'oglas_errors': oglas_form.errors,
                'slike_errors': [{'slika': 'Obavezno polje.'}] if not slike else None
            }
            return Response(errors, status=400)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def azuriraj_oglas(request, oglas_id):
    try:
        oglas = Oglas.objects.get(pk=oglas_id, korisnik=request.user)
    except Oglas.DoesNotExist:
        return Response({'error': 'Oglas nije pronađen ili nemate autorizaciju.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OglasSerializer(oglas)
        return Response(serializer.data)

    elif request.method == 'PUT':
        oglas_form = FormaZaIzraduOglasa(request.POST, instance=oglas)
        slike = request.FILES.getlist('slike')

        if oglas_form.is_valid():
            for stara_slika in oglas.slike.all():
                if stara_slika.slika:
                    file_path = os.path.join(settings.MEDIA_ROOT, stara_slika.slika.path)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                stara_slika.delete() 

            
            for nova_slika in slike:
                Slika.objects.create(oglas=oglas, slika=nova_slika)

            
            oglas = oglas_form.save()

            return Response(OglasSerializer(oglas).data, status=status.HTTP_200_OK)
        else:
            errors = {
                'oglas_errors': oglas_form.errors,
                'slike_errors': [{'slika': 'Obavezno polje.'}] if not slike else None
            }
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        
    
@api_view(['GET'])
def moji_oglasi(request):
    if request.user.is_authenticated:
        oglasi = Oglas.objects.filter(korisnik=request.user)
        oglasi_data = OglasSerializer(oglasi, many=True).data

        for oglas in oglasi_data:
            slike = Slika.objects.filter(oglas_id=oglas['id'])
            slike_data = SlikaSerializer(slike, many=True).data
            oglas['slike'] = [slika['slika'] for slika in slike_data]

        return Response({'oglasi': oglasi_data})
    else:
        return Response({'error': 'Korisnik nije autenticiran'}, status=status.HTTP_401_UNAUTHORIZED)



@login_required
def uredi_oglas(request, kategorija_url, oglas_naziv, sifra):
    oglas = get_object_or_404(Oglas, sifra=sifra)

    if request.method == 'POST':
        form = FormaZaIzraduOglasa(request.POST, request.FILES, instance=oglas)
        if form.is_valid():
            if 'delete_slike' in request.POST:
                slike_to_delete_ids = request.POST.getlist('delete_slike')
                oglas.slike.filter(id__in=slike_to_delete_ids).delete()
            oglas = form.save(commit=False)
            for img in request.FILES.getlist('slike'):
                img_str = base64.b64encode(img.read()).decode('utf-8')
                Slika.objects.create(oglas=oglas, slika=img_str)
            oglas.save()
            return redirect('moji_oglasi')
    else:
        form = FormaZaIzraduOglasa(instance=oglas)

    return render(request, 'uredi_oglas.html', {'form': form})

@api_view(['DELETE'])
def izbrisi_oglas(request, pk):
    try:
        oglas = Oglas.objects.get(pk=pk, korisnik=request.user)
    except Oglas.DoesNotExist:
        return Response({'error': 'Oglas nije pronaden ili nije autoriziran'}, status=status.HTTP_404_NOT_FOUND)

    slike = Slika.objects.filter(oglas=oglas)
    for slika in slike:
        if slika.slika:
            file_path = os.path.join(settings.MEDIA_ROOT, slika.slika.path)
            if os.path.isfile(file_path):
                os.remove(file_path)
        slika.delete()

    oglas.delete()
    return Response({'success': 'Oglas izbrisan'}, status=status.HTTP_204_NO_CONTENT)

def dohvati_podkategorije(kategorija):
    potkategorije = [kategorija]
    for dijete in kategorija.children.all():
        potkategorije.extend(dohvati_podkategorije(dijete))
    return potkategorije

def oglasi_po_kategoriji(request, url):
    kategorija = get_object_or_404(Kategorija, url=url)
    potkategorije = dohvati_podkategorije(kategorija)
    oglasi = Oglas.objects.filter(kategorija__in=potkategorije).select_related('korisnik__zupanija', 'korisnik__grad')
    oglasi_sa_slikama = []
    for oglas in oglasi:
        slike = Slika.objects.filter(oglas=oglas).values_list('slika', flat=True)
        slike_urls = [f"{settings.MEDIA_URL}{slika}" for slika in slike]
        korisnik = oglas.korisnik
        korisnik_info = {
            'zupanija': korisnik.zupanija.naziv if korisnik.zupanija else None,
            'grad': korisnik.grad.naziv if korisnik.grad else None,
            'telefon': korisnik.telefon
        }
        
        if request.user.is_authenticated:
           
            favorited = Favorit.objects.filter(korisnik=request.user, oglas=oglas).exists()
        else:
            favorited = False
        oglasi_sa_slikama.append({
            'id': oglas.id,
            'naziv': oglas.naziv,
            'datum': oglas.datum,
            'sifra': oglas.sifra,
            'cijena': oglas.cijena,
            'kategorija': oglas.kategorija.naziv,
            'slike': slike_urls,
            'korisnik': korisnik_info,
            'favorited': favorited 
        })

    hijerarhija = []
    trenutna_kategorija = kategorija
    while trenutna_kategorija:
        hijerarhija.insert(0, {'naziv': trenutna_kategorija.naziv, 'url': trenutna_kategorija.url})
        trenutna_kategorija = trenutna_kategorija.roditelj

    children = kategorija.children.all().values('naziv', 'url')

    return JsonResponse({
        'kategorija': kategorija.naziv, 
        'oglasi': oglasi_sa_slikama, 
        'hijerarhija': hijerarhija, 
        'children': list(children)
    })

def oglas_detalji(request, sifra):
    oglas = get_object_or_404(Oglas, sifra=sifra)
    
    slike = Slika.objects.filter(oglas=oglas).values_list('slika', flat=True)
    slike_urls = [f"{settings.MEDIA_URL}{slika}" for slika in slike]
    
    korisnik = oglas.korisnik
    korisnik_info = {
        'username': korisnik.username,
        'zupanija': korisnik.zupanija.naziv if korisnik.zupanija else None,
        'grad': korisnik.grad.naziv if korisnik.grad else None,
        'telefon': korisnik.telefon,
        'email': korisnik.email
    }
    
    if request.user.is_authenticated:
        favorited = Favorit.objects.filter(korisnik=request.user, oglas=oglas).exists()
    else:
        favorited = False
    
    ip_address = request.META.get('REMOTE_ADDR')
    
    # Calculate 24 hours ago from now
    now = timezone.now()
    twenty_four_hours_ago = now - timedelta(hours=24)
    
    if not Pregled.objects.filter(oglas=oglas, ip_address=ip_address, timestamp__gte=twenty_four_hours_ago).exists():
        Pregled.objects.create(oglas=oglas, ip_address=ip_address)
    
    broj_pregleda = Pregled.objects.filter(oglas=oglas).count()
    
    hijerarhija = []
    trenutna_kategorija = oglas.kategorija
    while trenutna_kategorija:
        hijerarhija.insert(0, {'naziv': trenutna_kategorija.naziv, 'url': trenutna_kategorija.url})
        trenutna_kategorija = trenutna_kategorija.roditelj
    
    data = {
        'id': oglas.id,
        'naziv': oglas.naziv,
        'opis': oglas.opis,
        'datum': oglas.datum,
        'sifra': oglas.sifra,
        'cijena': oglas.cijena,
        'kategorija': oglas.kategorija.naziv,
        'slike': slike_urls,
        'korisnik': korisnik_info,
        'favorited': favorited,
        'hijerarhija': hijerarhija,
        'broj_pregleda': broj_pregleda,
    }
    
    return JsonResponse(data)


def pretraga_oglasi(request):
    query = request.GET.get('q', '')
    if 'prijedlozi' in request.GET:
        prijedlozi = Oglas.objects.filter(naziv__icontains=query).values_list('naziv', flat=True)[:5]
        return JsonResponse({'prijedlozi': list(prijedlozi)})
    
    oglasi = Oglas.objects.filter(naziv__icontains=query) | Oglas.objects.filter(sifra__icontains=query)
    oglasi_sa_slikama = []

    for oglas in oglasi:
        slike = Slika.objects.filter(oglas=oglas).values_list('slika', flat=True)
        slike_urls = [f"{settings.MEDIA_URL}{slika}" for slika in slike]
        korisnik = oglas.korisnik
        korisnik_info = {
            'zupanija': korisnik.zupanija.naziv if korisnik.zupanija else None,
            'grad': korisnik.grad.naziv if korisnik.grad else None,
            'telefon': korisnik.telefon
        }
        oglasi_sa_slikama.append({
            'id': oglas.id,
            'naziv': oglas.naziv,
            'datum': oglas.datum,
            'sifra': oglas.sifra,
            'kategorija': oglas.kategorija.naziv,
            'cijena': oglas.cijena,
            'slike': slike_urls,
            'korisnik': korisnik_info
        })

    return JsonResponse({'oglasi': oglasi_sa_slikama})


def dohvati_korisnika(request, username):
    try:
        korisnik = Korisnik.objects.get(username=username)
        korisnik_info = KorisnikSerializer(korisnik).data

        
        oglasi = Oglas.objects.filter(korisnik=korisnik)
        oglasi_data = OglasSerializer(oglasi, many=True).data

        response_data = {
            'korisnik': korisnik_info,
            'oglasi': oglasi_data
        }
        return JsonResponse(response_data)
    except Korisnik.DoesNotExist:
        return JsonResponse({'error': 'Korisnik not found'}, status=404)


