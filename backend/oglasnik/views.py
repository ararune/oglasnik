# views.py
from rest_framework import viewsets
from .models import Zupanija, Grad, Korisnik, Kategorija, Oglas, Slika
from .serializers import ZupanijaSerializer, GradSerializer, KorisnikSerializer, KategorijaSerializer, OglasSerializer, SlikaSerializer
from .forms import FormaZaRegistraciju, FormaZaIzraduOglasa
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
        form = FormaZaRegistraciju(request.POST)
        if form.is_valid():
            oib = form.cleaned_data['oib']
            if Korisnik.objects.filter(oib=oib).exists():
                form.add_error('oib', 'OIB mora biti jedinstven.')
            else:
                form.save()
                # Redirect to the React homepage
                return redirect('http://localhost:3000/')
    else:
        form = FormaZaRegistraciju()
    return render(request, 'registracija.html', {'form': form})

@login_required
def trenutni_korisnik(request):
    user = request.user
    try:
        user_info = {
            'id': user.id,
            'korisnicko_ime': user.username,
            'ime': user.first_name or 'N/A',
            'prezime': user.last_name or 'N/A',
            'email': user.email,
            'datum_pridruzivanja': user.date_joined.strftime("%d/%m/%Y %H:%M:%S"),
            'grad': user.grad.naziv if hasattr(user, 'grad') and user.grad else 'N/A',
            'zupanija': user.zupanija.naziv if hasattr(user, 'zupanija') and user.zupanija else 'N/A',
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'uloga': 'Admin' if user.is_superuser else 'Staff' if user.is_staff else 'Korisnik'
        }
        return JsonResponse(user_info)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@login_required
def odjava(request):
    logout(request)
    return redirect('http://localhost:3000/')

@login_required
def profil(request):
    user = request.user
    return render(request, 'profil.html', {'user': user})

@login_required
def kreiraj_oglas(request):
    if request.method == 'POST':
        form = FormaZaIzraduOglasa(request.POST, request.FILES)
        if form.is_valid():
            oglas = form.save(commit=False)
            oglas.korisnik = request.user
            oglas.save()
            for img in request.FILES.getlist('slike'):
                img_str = base64.b64encode(img.read()).decode('utf-8')
                Slika.objects.create(oglas=oglas, slika=img_str)
            return redirect('http://localhost:3000/')
    else:
        form = FormaZaIzraduOglasa()
    return render(request, 'kreiraj_oglas.html', {'form': form})

@login_required
def moji_oglasi(request):
    oglasi = Oglas.objects.filter(korisnik=request.user).values('id', 'naziv', 'opis', 'cijena', 'datum')
    return JsonResponse({'oglasi': list(oglasi)})

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

@login_required
def izbrisi_oglas(request, oglas_id):
    oglas = get_object_or_404(Oglas, id=oglas_id)
    if request.method == 'POST':
        oglas.delete()
        return redirect('moji_oglasi')
    return redirect('moji_oglasi')

def oglasi_po_kategoriji(request, url):
    kategorija = get_object_or_404(Kategorija, url=url)

    def dohvati_podkategorije(kategorija):
        potkategorije = [kategorija]
        for dijete in kategorija.children.all():
            potkategorije.extend(dohvati_podkategorije(dijete))
        return potkategorije

    potkategorije = dohvati_podkategorije(kategorija)
    oglasi = Oglas.objects.filter(kategorija__in=potkategorije)

    hijerarhija = []
    trenutna_kategorija = kategorija
    while trenutna_kategorija:
        hijerarhija.insert(0, trenutna_kategorija)
        trenutna_kategorija = trenutna_kategorija.roditelj

    return render(request, 'oglasi_po_kategoriji.html', {'kategorija': kategorija, 'oglasi': oglasi, 'hijerarhija': hijerarhija})


def oglas_detalji(request, kategorija_url, oglas_naziv, sifra):
    oglas = get_object_or_404(Oglas, sifra=sifra)
    slike = oglas.slike.all()

    hijerarhija = []
    trenutna_kategorija = oglas.kategorija
    while trenutna_kategorija:
        hijerarhija.insert(0, trenutna_kategorija)
        trenutna_kategorija = trenutna_kategorija.roditelj

    return render(request, 'oglas_detalji.html', {'oglas': oglas, 'slike': slike, 'hijerarhija': hijerarhija})

