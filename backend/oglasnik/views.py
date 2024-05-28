from rest_framework import viewsets
from .models import Zupanija, Grad, Korisnik, Kategorija, Oglas, Slika
from .serializers import ZupanijaSerializer, GradSerializer, KorisnikSerializer, KategorijaSerializer, OglasSerializer, SlikaSerializer
from .forms import FormaZaRegistraciju, FormaZaIzraduOglasa, SlikaForma
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

import os
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

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
        zupanija_id = self.request.query_params.get('zupanija')  # Get Zupanija ID from query parameters
        if zupanija_id:
            queryset = queryset.filter(zupanija_id=zupanija_id)  # Filter Gradovi based on Zupanija ID
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
    return render(request, 'profil.html', {'user': user})

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
                'slike_errors': [{'slika': 'This field is required.'}] if not slike else None
            }
            return Response(errors, status=400)

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
            # Handle image deletion
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

    oglasi_with_images = []
    for oglas in oglasi:
        slike = Slika.objects.filter(oglas=oglas).values_list('slika', flat=True)
        slike_urls = [f"{settings.MEDIA_URL}{slika}" for slika in slike]
        korisnik = oglas.korisnik
        korisnik_info = {
            'zupanija': korisnik.zupanija.naziv if korisnik.zupanija else None,
            'grad': korisnik.grad.naziv if korisnik.grad else None
        }
        oglasi_with_images.append({
            'id': oglas.id,
            'naziv': oglas.naziv,
            'datum': oglas.datum,
            'cijena': oglas.cijena,
            'slike': slike_urls,
            'korisnik': korisnik_info
        })

    hijerarhija = []
    trenutna_kategorija = kategorija
    while trenutna_kategorija:
        hijerarhija.insert(0, {'naziv': trenutna_kategorija.naziv, 'url': trenutna_kategorija.url})
        trenutna_kategorija = trenutna_kategorija.roditelj

    children = kategorija.children.all().values('naziv', 'url')

    return JsonResponse({'kategorija': kategorija.naziv, 'oglasi': oglasi_with_images, 'hijerarhija': hijerarhija, 'children': list(children)})




def oglas_detalji(request, kategorija_url, oglas_naziv, sifra):
    oglas = get_object_or_404(Oglas, sifra=sifra)
    slike = oglas.slike.all()

    hijerarhija = []
    trenutna_kategorija = oglas.kategorija
    while trenutna_kategorija:
        hijerarhija.insert(0, trenutna_kategorija)
        trenutna_kategorija = trenutna_kategorija.roditelj

    return render(request, 'oglas_detalji.html', {'oglas': oglas, 'slike': slike, 'hijerarhija': hijerarhija})

